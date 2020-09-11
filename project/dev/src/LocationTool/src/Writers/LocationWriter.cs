using LocationTool.Core;

using System.IO;

namespace LocationTool.Writers
{
    public class LocationWriter : IWriter<string>
    {
        private readonly string outputDir;

        public LocationWriter(string rootDir, string locationName)
        {
            outputDir = $"{rootDir}\\output\\locations\\{locationName}\\";
        }

        public void Write(string contents)
        {
            if (!Directory.Exists($"{outputDir}"))
                Directory.CreateDirectory($"{outputDir}");

            File.WriteAllText(outputDir + "base.json", contents);
        }
    }
}
