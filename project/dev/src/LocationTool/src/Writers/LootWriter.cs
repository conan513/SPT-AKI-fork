using LocationTool.Core;
using LocationTool.Models;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace LocationTool.Writers
{
    public class LootWriter : IWriter<List<Loot>>
    {
        private readonly string outputDir;

        public LootWriter(string rootDir, string locationName)
        {
            outputDir = rootDir + $"\\output\\locations\\{locationName}\\";

            if (!Directory.Exists($"{outputDir}"))
                Directory.CreateDirectory($"{outputDir}");
        }

        public void Write(List<Loot> output)
        {
            var dynamic = Generate(output, LootType.Dynamic);
            var statics = Generate(output, LootType.Static);
            var forced = Generate(output, LootType.Forced);

            var combinedLoot = new string[] { forced, statics, dynamic };
            File.WriteAllText(outputDir + "loot.json", "{ \"Loot\":[" + string.Join(",", combinedLoot) + "]}");
        }

        private string Generate(List<Loot> loots, LootType type)
        {
            var lootJson = loots
                .Where(loot => loot.Type == type)
                .GroupBy(loot => loot.Id)
                .Select(g => GenerateLootPresets(g.Key, g.ToList()));

            var combined = string.Join(",", lootJson).Replace("\n", "").Replace("\r", "");
            return $"{{\"Type\":\"{type}\",\"LootList\":[{combined}]}}";
        }

        private string GenerateLootPresets(string id, List<Loot> loots)
        {
            var lootData = string.Join(",", loots.ToList().Select(loot => loot.Json.ToString()));
            return $"{{\"Id\":\"{id}\",\"Data\":[{lootData}]}}".Replace("\n", "").Replace("\r", "");
        }
    }
}