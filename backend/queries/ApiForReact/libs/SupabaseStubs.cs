// Minimal stubs to allow compilation when the real Supabase client package isn't referenced.
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace Supabase
{
    public class SupabaseOptions
    {
        public bool AutoConnectRealtime { get; set; }
    }

    public class Client
    {
        private readonly string _url;
        private readonly string _key;
        private readonly SupabaseOptions _options;

        public Client(string url, string key, SupabaseOptions options)
        {
            _url = url;
            _key = key;
            _options = options;
        }

        public Task InitializeAsync() => Task.CompletedTask;

        public FromQuery<T> From<T>() where T : Postgrest.Models.BaseModel, new()
        {
            return new FromQuery<T>();
        }
    }

    public class FromQuery<T> where T : Postgrest.Models.BaseModel, new()
    {
        public Task<PostgrestResponse<T>> Insert(T entity)
        {
            var response = new PostgrestResponse<T>
            {
                ResponseMessage = new HttpResponseMessage(HttpStatusCode.OK),
                Models = new List<T> { entity }
            };
            return Task.FromResult(response);
        }

        public Task<PostgrestResponse<T>> Get()
        {
            var response = new PostgrestResponse<T>
            {
                ResponseMessage = new HttpResponseMessage(HttpStatusCode.OK),
                Models = new List<T>()
            };
            return Task.FromResult(response);
        }

        public Task<PostgrestResponse<T>> Update(T entity)
        {
            var response = new PostgrestResponse<T>
            {
                ResponseMessage = new HttpResponseMessage(HttpStatusCode.OK),
                Models = new List<T> { entity }
            };
            return Task.FromResult(response);
        }

        public FromQuery<T> Where(Expression<Func<T, bool>> predicate)
        {
            return this;
        }

        public Task<PostgrestResponse<T>> Update()
        {
            var response = new PostgrestResponse<T>
            {
                ResponseMessage = new HttpResponseMessage(HttpStatusCode.OK),
                Models = new List<T>()
            };
            return Task.FromResult(response);
        }

        // Delete a specific entity
        public Task<PostgrestResponse<T>> Delete(T entity)
        {
            var response = new PostgrestResponse<T>
            {
                ResponseMessage = new HttpResponseMessage(HttpStatusCode.OK),
                Models = new List<T> { entity }
            };
            return Task.FromResult(response);
        }

        // Delete by condition (called after .Where(...).Delete())
        public Task<PostgrestResponse<T>> Delete()
        {
            var response = new PostgrestResponse<T>
            {
                ResponseMessage = new HttpResponseMessage(HttpStatusCode.OK),
                Models = new List<T>()
            };
            return Task.FromResult(response);
        }
    }

    public class PostgrestResponse<T>
    {
        public HttpResponseMessage ResponseMessage { get; set; } = new HttpResponseMessage(HttpStatusCode.OK);
        public List<T> Models { get; set; } = new List<T>();
    }
}

namespace Supabase.Postgrest.Models
{
    public class BaseModel
    {
        // stub for base model
    }
}
