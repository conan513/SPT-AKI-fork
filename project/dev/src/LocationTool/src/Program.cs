using LocationTool.Loggers;
using LocationTool.Reader;
using LocationTool.Writers;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LocationTool
{
    class Program
    {
        // TODO: Load from config?
        static readonly string[] locations = new string[] {
            "bigmap", "develop", "factory4_day", "factory4_night",
            "interchange", "laboratory", "rezervbase", "shoreline",
            "woods" };

        static void Main(string[] args)
        {
            Run();
        }

        static void Run()
        {
            var logger = new ConsoleLogger();
            var processors = locations.Select(locationName =>
                new LocationProcessor(locationName, new JsonFileReader("data"), new LocationWriter("data", locationName), logger));

            var processTasks = new List<Task>();

            foreach (var processor in processors)
                processTasks.Add(Task.Run(() => { processor.Process(); }));

            Task.WhenAll(processTasks).Wait();
            logger.WriteLineSuccess($"TOTAL LOOT COUNT: {processors.Sum(p => p.LootCount)}");
        }
    }
}