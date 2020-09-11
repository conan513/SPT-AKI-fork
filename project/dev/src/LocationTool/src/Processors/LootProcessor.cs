using LocationTool.Core;
using LocationTool.Models;
using LocationTool.Utilities;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace LocationTool.Processors
{
    public class LootProcessor : IProcessor
    {
        private readonly static List<string> questLoot = new List<string>() {
            "quest", "giroscope", "controller", "case_0060", "loot_letter", "blood_probe",
            "loot_letter", "009_2_doc", "010_4_flash", "009_1_nout", "008_5_key", "010_5_drive",
            "loot 56(28)", "loot_case", "SAS", "chem_container", "huntsman_001_message2284354",
            "vedodmost", "book", "Loot 56 (28)6937524", "loot_flash" };

        private readonly JsonDocument document;
        private readonly IWriter<List<Loot>> writer;

        public LootProcessor(JsonDocument document, IWriter<List<Loot>> writer)
        {
            this.document = document;
            this.writer = writer;
        }

        public int PresetCount { get; private set; }

        public int DupeCount { get; private set; }

        public void Process()
        {
            var lootList = new List<Loot>();

            for (var i = 0; i < document.RootElement.GetArrayLength(); i++)
            {
                var locationData = document.RootElement[i].GetProperty("Location");
                var lootData = locationData.GetProperty("Loot");

                for (var j = 0; j < lootData.GetArrayLength(); j++)
                {
                    var loot = JsonSerializer.Deserialize<Loot>(lootData[j].ToString());
                    loot.Index = j;
                    loot.Json = lootData[j];

                    if (questLoot.Any(q => loot.Id.Contains(q, StringComparison.OrdinalIgnoreCase)))
                        loot.Type = LootType.Forced;
                    else
                        loot.Type = loot.IsStatic ? LootType.Static : LootType.Dynamic;

                    if (LootComparer.Compare(loot, lootList))
                    {
                        DupeCount++;
                        continue;
                    }

                    lootList.Add(loot);
                }
            }

            PresetCount = lootList.Count;
            writer.Write(lootList);
        }
    }
}
