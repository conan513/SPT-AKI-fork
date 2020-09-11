using LocationTool.Core;

using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace LocationTool.Processors
{

    public class SimpleProcessor : IProcessor
    {
        private readonly JsonDocument document;
        private readonly string propertyName;
        private readonly IWriter<List<JsonElement>> writer;

        public SimpleProcessor(JsonDocument document, string propertyName, IWriter<List<JsonElement>> writer)
        {
            this.document = document;
            this.propertyName = propertyName;
            this.writer = writer;
        }

        public int Count { get; private set; }

        public void Process()
        {
            if (!document.RootElement[0].GetProperty("Location").TryGetProperty(propertyName, out var property))
                return;

            Count = property.GetArrayLength();

            if (Count > 0)
                writer.Write(property.EnumerateArray().ToList());

            return;
        }
    }
}
