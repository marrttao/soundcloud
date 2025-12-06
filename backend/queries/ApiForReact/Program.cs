using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using queries.services;
using queries.models;
using Supabase;

namespace queries.ApiForReact
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Register Supabase-related services that exist in the project.
            builder.Services.AddSingleton<SupabaseService>();
            builder.Services.AddSingleton(sp => sp.GetRequiredService<SupabaseService>()._supabase);

            builder.Services.AddScoped<InsertService>();
            builder.Services.AddScoped<FetchService>();
            builder.Services.AddScoped<UpdateService>();
            builder.Services.AddScoped<DeleteService>();
            builder.Services.AddScoped<ProfileService>();

            // CORS so React can call this API
            builder.Services.AddCors(options => options.AddPolicy("Any", p =>
                p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

            var app = builder.Build();

            app.UseCors("Any");

            app.MapPost("/call", async (CallRequest request, IServiceProvider sp) =>
            {
                var service = sp.GetService(Type.GetType(request.Service)!);
                if (service == null) return Results.BadRequest("Service not found");

                var method = service.GetType().GetMethod(request.Method);
                if (method == null) return Results.BadRequest("Method not found");

                object? param = request.Parameters?.Any() == true
                    ? JsonSerializer.Deserialize(request.Parameters[0].ToString()!, method.GetParameters()[0].ParameterType)!
                    : null;

                var result = method.Invoke(service, param != null ? new[] { param } : null);

                if (result is Task task)
                {
                    await task.ConfigureAwait(false);
                    if (task.GetType().IsGenericType)
                        result = task.GetType().GetProperty("Result")!.GetValue(task);
                    else
                        result = null;
                }

                return Results.Ok(result);
            });

            app.MapPost("/auth/signup", async (AuthRequest request, SupabaseService supabase, HttpContext httpContext) =>
            {
                var response = await supabase.SignUpAsync(request.Email, request.Password);
                return await ProxyHttpResponse(response, httpContext);
            });

            app.MapPost("/auth/signin", async (AuthRequest request, SupabaseService supabase, HttpContext httpContext) =>
            {
                var response = await supabase.SignInAsync(request.Email, request.Password);
                return await ProxyHttpResponse(response, httpContext);
            });

            app.MapPost("/auth/signout", async (HttpRequest httpRequest, SupabaseService supabase, HttpContext httpContext) =>
            {
                var token = ExtractBearerToken(httpRequest);
                if (string.IsNullOrEmpty(token))
                {
                    return Results.BadRequest("Authorization header required");
                }

                var response = await supabase.SignOutAsync(token);
                return await ProxyHttpResponse(response, httpContext);
            });

            app.MapGet("/profile/me", async (HttpRequest httpRequest, ProfileService profileService, SupabaseService supabase) =>
            {
                var token = ExtractBearerToken(httpRequest);
                if (string.IsNullOrEmpty(token))
                {
                    return Results.Unauthorized();
                }

                var user = await supabase.GetUserAsync(token);
                if (user == null)
                {
                    return Results.Unauthorized();
                }

                var profile = await profileService.BuildProfileAsync(token);
                return profile is { } ? Results.Ok(profile) : Results.NotFound();
            });

            app.MapPost("/profile/complete", async (ProfileUpsertRequest update, HttpRequest httpRequest, SupabaseService supabase) =>
            {
                var token = ExtractBearerToken(httpRequest);
                if (string.IsNullOrEmpty(token))
                {
                    return Results.Unauthorized();
                }

                try
                {
                    await supabase.UpsertProfileAsync(update, token);
                    return Results.Ok();
                }
                catch (HttpRequestException ex)
                {
                    var status = ex.StatusCode ?? HttpStatusCode.BadRequest;
                    return Results.StatusCode((int)status);
                }
            });

            app.MapGet("/profile/{username}", async (string username, HttpRequest httpRequest, ProfileService profileService, SupabaseService supabase) =>
            {
                var token = ExtractBearerToken(httpRequest);
                if (string.IsNullOrEmpty(token))
                {
                    return Results.Unauthorized();
                }

                var user = await supabase.GetUserAsync(token);
                if (user == null)
                {
                    return Results.Unauthorized();
                }

                var profile = await profileService.BuildProfileByUsernameAsync(username, token);
                return profile is { } ? Results.Ok(profile) : Results.NotFound();
            });

            app.MapGet("/search", async (HttpRequest httpRequest, SupabaseService supabase, string? q) =>
            {
                var token = ExtractBearerToken(httpRequest);
                if (string.IsNullOrEmpty(token))
                {
                    return Results.Unauthorized();
                }

                if (string.IsNullOrWhiteSpace(q))
                {
                    return Results.Ok(new { profiles = new List<object>(), tracks = new List<object>() });
                }

                var profiles = await supabase.SearchProfilesAsync(q, token);
                var tracks = await supabase.SearchTracksAsync(q, token);
                
                return Results.Ok(new { profiles, tracks });
            });

            await app.RunAsync();
        }

        private static string? ExtractBearerToken(HttpRequest request)
        {
            var authorization = request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrEmpty(authorization) || !authorization.StartsWith("Bearer "))
            {
                return null;
            }

            return authorization.Substring(7);
        }

        private static async Task<IResult> ProxyHttpResponse(HttpResponseMessage response, HttpContext httpContext)
        {
            var payload = await response.Content.ReadAsStringAsync();
            var status = (int)response.StatusCode;
            response.Dispose();
            httpContext.Response.StatusCode = status;
            return Results.Content(payload, "application/json");
        }
    }

    internal record CallRequest(string Service, string Method, JsonElement[]? Parameters);
    internal record AuthRequest(string Email, string Password);
}
