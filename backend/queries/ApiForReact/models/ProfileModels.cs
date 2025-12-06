using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace queries.models;

public record SupabaseUser
{
    [JsonPropertyName("id")]
    public Guid Id { get; init; }

    [JsonPropertyName("email")]
    public string? Email { get; init; }

    [JsonPropertyName("role")]
    public string? Role { get; init; }
}

public record ProfileDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; init; }

    [JsonPropertyName("username")]
    public string Username { get; init; } = string.Empty;

    [JsonPropertyName("full_name")]
    public string? FullName { get; init; }

    [JsonPropertyName("avatar_url")]
    public string? AvatarUrl { get; init; }

    [JsonPropertyName("banner_url")]
    public string? BannerUrl { get; init; }

    [JsonPropertyName("bio")]
    public string? Bio { get; init; }
}

public record ProfileUpsertRequest
{
    [JsonPropertyName("username")]
    public string Username { get; init; } = string.Empty;

    [JsonPropertyName("fullName")]
    public string? FullName { get; init; }

    [JsonPropertyName("avatarUrl")]
    public string? AvatarUrl { get; init; }

    [JsonPropertyName("bio")]
    public string? Bio { get; init; }

    [JsonPropertyName("bannerUrl")]
    public string? BannerUrl { get; init; }
}

public record ProfileStats(int Followers, int Following, int Tracks, int Likes);

public record TrackSummary
{
    public string Title { get; init; } = string.Empty;
    public int Plays { get; init; }
    public int Likes { get; init; }
    public string Artist { get; init; } = string.Empty;
    public string? ArtistAvatar { get; init; }
}

public record SimpleProfile
{
    public Guid Id { get; init; }
    public string Username { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
    public int Followers { get; init; }
    public int Tracks { get; init; }
    [JsonPropertyName("banner_url")]
    public string? BannerUrl { get; init; }
}

public record ProfileViewModel
{
    [JsonPropertyName("profile")]
    public ProfileDto Profile { get; init; } = null!;
    
    [JsonPropertyName("stats")]
    public ProfileStats Stats { get; init; } = null!;
    
    [JsonPropertyName("tracks")]
    public List<TrackSummary> Tracks { get; init; } = new();
    
    [JsonPropertyName("likes")]
    public List<TrackSummary> Likes { get; init; } = new();
    
    [JsonPropertyName("following")]
    public List<SimpleProfile> Following { get; init; } = new();
}

public record TrackRecord
{
    [JsonPropertyName("id")]
    public long Id { get; init; }

    [JsonPropertyName("title")]
    public string Title { get; init; } = string.Empty;

    [JsonPropertyName("plays_count")]
    public long PlaysCount { get; init; }

    [JsonPropertyName("likes_count")]
    public long LikesCount { get; init; }

    [JsonPropertyName("user_id")]
    public Guid UserId { get; init; }
    
}

public record TrackLikeRecord
{
    [JsonPropertyName("track")]
    public TrackRecord Track { get; init; } = null!;
}

public record FollowingRelation
{
    [JsonPropertyName("following_id")]
    public Guid FollowingId { get; init; }
}

public record FollowerCount
{
    [JsonPropertyName("following_id")]
    public Guid FollowingId { get; init; }
}

public record TrackCountRecord
{
    [JsonPropertyName("user_id")]
    public Guid UserId { get; init; }
}

public record TrackSearchResult
{
    [JsonPropertyName("id")]
    public long Id { get; init; }

    [JsonPropertyName("title")]
    public string Title { get; init; } = string.Empty;

    [JsonPropertyName("user_id")]
    public Guid UserId { get; init; }
}
