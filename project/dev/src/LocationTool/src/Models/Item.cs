using System.Text.Json.Serialization;

namespace LocationTool.Models
{
    public class Item
    {
        [JsonPropertyName("_id")]
        public string Id { get; set; }

        [JsonPropertyName("_tpl")]
        public string Tpl { get; set; }

        [JsonPropertyName("upd")]
        public StackCount StackCount { get; set; }

        [JsonIgnore]
        public int Count
        {
            get
            {
                return StackCount is null ? 0 : StackCount.Value;
            }
        }
    }
}
