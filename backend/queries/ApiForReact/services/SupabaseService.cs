using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using queries.models;
using Supabase;

namespace queries.services;

public class SupabaseService
{
    private readonly string _url;
    private readonly string _key;
    private readonly SupabaseOptions _options;
    public Client _supabase { get; }
    private readonly HttpClient _httpClient;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public SupabaseService()
    {
        var tokenReader = new TokenReader.TokenReader();
        _url = tokenReader.GetSupabaseUrl();
        _key = tokenReader.GetSupabaseKey();
        _options = new SupabaseOptions
        {
            AutoConnectRealtime = true
        };
        _supabase = new Client(_url, _key, _options);
        _httpClient = new HttpClient { BaseAddress = new Uri(_url) };
        _httpClient.DefaultRequestHeaders.Add("apikey", _key);
    }

    public async Task InitializeAsync()
    {
        await _supabase.InitializeAsync();
    }

    private HttpRequestMessage CreateAuthRequest(HttpMethod method, string path, object? body = null, string? bearer = null)
    {
        var request = new HttpRequestMessage(method, path);
        var token = bearer ?? _key;
        if (string.IsNullOrEmpty(token))
        {
            throw new InvalidOperationException("Bearer token or service key is required.");
        }
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        if (body != null)
        {
            request.Content = JsonContent.Create(body);
        }

        return request;
    }

    private Task<HttpResponseMessage> SendAuthRequestAsync(HttpMethod method, string path, object? body = null, string? bearer = null)
        => _httpClient.SendAsync(CreateAuthRequest(method, path, body, bearer));

    private Task<HttpResponseMessage> SendAuthRequestAsyncRequired(HttpMethod method, string path, object? body, string accessToken)
    {
        if (string.IsNullOrEmpty(accessToken))
        {
            throw new InvalidOperationException("Access token is required for this operation.");
        }
        return SendAuthRequestAsync(method, path, body, accessToken);
    }

    private async Task<T?> ReadJsonAsync<T>(HttpResponseMessage response)
    {
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<T>(_jsonOptions);
    }

    private static string FormatInList(IEnumerable<Guid> ids)
        => string.Join(',', ids.Select(id => id.ToString()));

    public async Task<SupabaseUser?> GetUserAsync(string accessToken)
        => await ReadJsonAsync<SupabaseUser>(await SendAuthRequestAsync(HttpMethod.Get, "/auth/v1/user", null, accessToken));

    public async Task<List<ProfileDto>> GetProfilesByIdsAsync(IEnumerable<Guid> ids, string accessToken)
    {
        var idList = ids.ToList();
        if (!idList.Any())
        {
            return new List<ProfileDto>();
        }

        return await FetchProfilesAsync($"id=in.({FormatInList(idList)})", accessToken);
    }

    public async Task<ProfileDto?> GetProfileByIdAsync(Guid userId, string accessToken)
    {
        var data = await FetchProfilesAsync($"id=eq.{userId}", accessToken);
        return data.FirstOrDefault();
    }

    public async Task<List<TrackRecord>> GetTracksAsync(Guid userId, string accessToken)
    {
        var path = $"/rest/v1/tracks?select=id,title,plays_count,likes_count,user_id&user_id=eq.{userId}&order=created_at.desc&limit=6";
        var response = await SendAuthRequestAsync(HttpMethod.Get, path, null, accessToken);
        return await ReadJsonAsync<List<TrackRecord>>(response) ?? new List<TrackRecord>();
    }

    public async Task<List<TrackLikeRecord>> GetLikedTracksAsync(Guid userId, string accessToken)
    {
        var path = $"/rest/v1/track_likes?select=track:tracks(id,title,plays_count,likes_count,user_id)&user_id=eq.{userId}&order=created_at.desc&limit=6";
        var response = await SendAuthRequestAsync(HttpMethod.Get, path, null, accessToken);
        return await ReadJsonAsync<List<TrackLikeRecord>>(response) ?? new List<TrackLikeRecord>();
    }

    public async Task<List<FollowingRelation>> GetFollowingRelationsAsync(Guid userId, string accessToken)
    {
        var path = $"/rest/v1/follows?select=following_id&follower_id=eq.{userId}&order=created_at.desc&limit=6";
        var response = await SendAuthRequestAsync(HttpMethod.Get, path, null, accessToken);
        return await ReadJsonAsync<List<FollowingRelation>>(response) ?? new List<FollowingRelation>();
    }

    public async Task<List<FollowerCount>> GetFollowerCountsAsync(IEnumerable<Guid> ids, string accessToken)
    {
        var idList = ids.ToList();
        if (!idList.Any())
        {
            return new List<FollowerCount>();
        }

        var path = $"/rest/v1/follows?select=following_id&following_id=in.({FormatInList(idList)})";
        var response = await SendAuthRequestAsync(HttpMethod.Get, path, null, accessToken);
        return await ReadJsonAsync<List<FollowerCount>>(response) ?? new List<FollowerCount>();
    }

    public async Task<List<TrackCountRecord>> GetTracksCountsForUsersAsync(IEnumerable<Guid> ids, string accessToken)
    {
        var idList = ids.ToList();
        if (!idList.Any())
        {
            return new List<TrackCountRecord>();
        }

        var path = $"/rest/v1/tracks?select=user_id&user_id=in.({FormatInList(idList)})";
        var response = await SendAuthRequestAsync(HttpMethod.Get, path, null, accessToken);
        return await ReadJsonAsync<List<TrackCountRecord>>(response) ?? new List<TrackCountRecord>();
    }

    public async Task<int> GetTracksCountAsync(Guid userId, string accessToken)
        => await GetCountAsync($"/rest/v1/tracks?select=id&user_id=eq.{userId}", accessToken);

    public async Task<int> GetLikesCountAsync(Guid userId, string accessToken)
        => await GetCountAsync($"/rest/v1/track_likes?select=track_id&user_id=eq.{userId}", accessToken);

    public async Task<int> GetFollowersCountAsync(Guid userId, string accessToken)
        => await GetCountAsync($"/rest/v1/follows?select=follower_id&following_id=eq.{userId}", accessToken);

    public async Task<int> GetFollowingCountAsync(Guid userId, string accessToken)
        => await GetCountAsync($"/rest/v1/follows?select=following_id&follower_id=eq.{userId}", accessToken);

    private async Task<int> GetCountAsync(string path, string accessToken)
    {
        var response = await SendAuthRequestAsync(HttpMethod.Get, path, null, accessToken);
        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadAsStringAsync();
        if (string.IsNullOrWhiteSpace(payload)) return 0;

        using var doc = JsonDocument.Parse(payload);
        return doc.RootElement.ValueKind == JsonValueKind.Array
            ? doc.RootElement.GetArrayLength()
            : 0;
    }

    public Task<HttpResponseMessage> SignUpAsync(string email, string password)
        => SendAuthRequestAsync(HttpMethod.Post, "/auth/v1/signup", new { email, password });

    public Task<HttpResponseMessage> SignInAsync(string email, string password)
        => SendAuthRequestAsync(HttpMethod.Post, "/auth/v1/token?grant_type=password", new { email, password });

    public Task<HttpResponseMessage> SignOutAsync(string accessToken)
        => SendAuthRequestAsync(HttpMethod.Post, "/auth/v1/logout", null, accessToken);

    public async Task<HttpResponseMessage> UpsertProfileAsync(ProfileUpsertRequest request, string accessToken)
    {
        var user = await GetUserAsync(accessToken);
        if (user == null)
        {
            throw new InvalidOperationException("Unable to identify the authenticated user.");
        }

        var payload = BuildProfilePayload(user.Id, request);
        var response = await SendUpsertAsync(payload, accessToken);
        return response;
    }

    private static Dictionary<string, object?> BuildProfilePayload(Guid userId, ProfileUpsertRequest request)
    {
        var payload = new Dictionary<string, object?>
        {
            ["id"] = userId,
            ["username"] = request.Username
        };

        if (!string.IsNullOrWhiteSpace(request.FullName))
        {
            payload["full_name"] = request.FullName;
        }

        if (!string.IsNullOrWhiteSpace(request.AvatarUrl))
        {
            payload["avatar_url"] = request.AvatarUrl;
        }

        if (!string.IsNullOrWhiteSpace(request.Bio))
        {
            payload["bio"] = request.Bio;
        }

        return payload;
    }

    private async Task<HttpResponseMessage> SendUpsertAsync(Dictionary<string, object?> payload, string accessToken)
    {
        var path = "/rest/v1/profiles?on_conflict=id";
        var response = await SendAuthRequestAsyncRequired(HttpMethod.Post, path, payload, accessToken);
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"[ERROR] Supabase upsert request failed");
            Console.WriteLine($"  Status: {response.StatusCode}");
            Console.WriteLine($"  Path: {path}");
            Console.WriteLine($"  Payload: {JsonSerializer.Serialize(payload)}");
            Console.WriteLine($"  Error: {errorContent}");
            throw new HttpRequestException(
                string.IsNullOrWhiteSpace(errorContent)
                    ? $"Supabase upsert failed with status {(int)response.StatusCode}."
                    : errorContent,
                null,
                response.StatusCode);
        }

        return response;
    }

    private async Task<List<ProfileDto>> FetchProfilesAsync(string filter, string accessToken)
    {
        var path = $"/rest/v1/profiles?select=id,username,full_name,avatar_url,bio&{filter}";
        var response = await SendAuthRequestAsync(HttpMethod.Get, path, null, accessToken);
        return await ReadJsonAsync<List<ProfileDto>>(response) ?? new List<ProfileDto>();
    }
}
