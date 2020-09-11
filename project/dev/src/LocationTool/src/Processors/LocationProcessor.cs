using LocationTool.Core;
using LocationTool.Processors;
using LocationTool.Writers;
using System.Text.Json;
using Newtonsoft.Json.Linq;

namespace LocationTool
{
    public class LocationProcessor : IProcessor
    {
        private readonly ILogger log;
        private readonly IReader input;
        private readonly IWriter<string> writer;
        private readonly string locationName;

        public LocationProcessor(string locationName, IReader input, IWriter<string> writer, ILogger log)
        {
            this.log = log;
            this.input = input;
            this.writer = writer;
            this.locationName = locationName;
        }

        public int LootCount { get; private set; }

        public void Process()
        {
            using var document = input.GetJson(locationName);
            if (document == null)
            {
                log.WriteLine($"Processing failed: No files found for {locationName}");
                return;
            }

            CreateBaseJson(new string[] { "waves", "exits", "BossLocationSpawn", "Loot", "SpawnAreas" }, document.RootElement[0].GetProperty("Location").ToString());
            var count = document.RootElement.GetArrayLength();
            log.WriteLineInfo($"{locationName} files found: {count}".ToUpper());
            SimpleProcess(document, "BossLocationSpawn", "bosses", "boss");
            SimpleProcess(document, "SpawnAreas", "entries", "infill");
            SimpleProcess(document, "exits", "exits", "exfill");
            SimpleProcess(document, "waves", "waves", "wave");

            var lootProcessor = new LootProcessor(document, new LootWriter("data", locationName));
            lootProcessor.Process();
            log.WriteLine($"Successfully processed loot on {locationName} | Presets : {lootProcessor.PresetCount} | Dupes : {lootProcessor.DupeCount}");
            LootCount = lootProcessor.PresetCount;
            return;
        }

        private void SimpleProcess(JsonDocument document, string property, string dir, string prefix)
        {
            var simple = new SimpleProcessor(document, property, new SimpleWriter("data", dir, prefix, locationName));
            simple.Process();
            log.WriteLineSuccess($"Successfully processed {property} on {locationName} | Count: {simple.Count}");
        }

        private void CreateBaseJson(string[] properties, string locationData)
        {
            var locationJson = JObject.Parse(locationData);

            foreach (var property in properties)
            {
                var array = (JArray)locationJson.Property(property).First;
                array.Clear();
            }

            writer.Write(locationJson.ToString());
        }
    }
}