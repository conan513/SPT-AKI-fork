using LocationTool.Core;

using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;

namespace LocationTool.Reader
{
    public class JsonFileReader : IReader
    { 
        private readonly string inputDir;

        public JsonFileReader(string rootDir)
        {
            inputDir = rootDir + "\\input";
        }

        public int FileCount { get; private set; }

        public JsonDocument GetJson(string locationName)
        {
            var files = Directory.EnumerateFiles(inputDir).Where(f => f.Contains(locationName, StringComparison.OrdinalIgnoreCase)).ToList();
            FileCount = files.Count;

            if (FileCount == 0)
                return null;

            var builder = new StringBuilder("[");
            foreach (var file in files)
            {
                builder.Append(File.ReadAllText(file) + ",");
            }
            builder.Remove(builder.Length - 1, 1);
            builder.Append("]");
            return JsonDocument.Parse(builder.ToString());
        }
    }
}