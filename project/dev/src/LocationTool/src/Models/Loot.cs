using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace LocationTool.Models
{
    public class Loot
    {
        public string Id { get; set; }
        public bool IsStatic { get; set; }
        public Vector3 Position { get; set; }
        public Vector3 Rotation { get; set; }
        public IList<Item> Items { get; set; }

        [JsonIgnore]
        public int Index { get; set; }

        [JsonIgnore]
        public LootType Type { get; set; }

        [JsonIgnore]
        public JsonElement Json { get; set; }
    }

    public class Vector3
    {
        [JsonPropertyName("x")]
        public double X { get; set; }

        [JsonPropertyName("y")]
        public double Y { get; set; }

        [JsonPropertyName("z")]
        public double Z { get; set; }
    }

    public class StackCount
    {
        [JsonPropertyName("StackObjectsCount")]
        public int Value { get; set; }
    }
}
