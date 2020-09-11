using System.Text.Json;

namespace LocationTool.Core
{
    public interface IReader
    {
        JsonDocument GetJson(string locationName);
    }
}