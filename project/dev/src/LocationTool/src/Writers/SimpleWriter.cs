using LocationTool.Core;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

namespace LocationTool.Writers
{
    public class SimpleWriter : IWriter<List<JsonElement>>
    {
        private readonly static JsonWriterOptions JSON_OPT = new JsonWriterOptions { Indented = true };
        private readonly string outputDir;
        private readonly string filePrefix;

        public SimpleWriter(string rootDir, string dir, string filePrefix, string locationName)
        {
            outputDir = $"{rootDir}\\output\\locations\\{locationName}\\{dir}";
            this.filePrefix = filePrefix;
        }

        public void Write(List<JsonElement> elements)
        {
            if (!Directory.Exists($"{outputDir}"))
                Directory.CreateDirectory($"{outputDir}");

            int index = 0;
            foreach (var element in elements)
            {
                using var sw = File.CreateText($"{outputDir}\\{filePrefix}_{index}.json");
                using var writer = new Utf8JsonWriter(sw.BaseStream, JSON_OPT);
                element.WriteTo(writer);
                index++;
            }
        }
    }
}