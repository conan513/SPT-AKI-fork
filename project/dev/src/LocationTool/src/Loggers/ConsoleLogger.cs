using LocationTool.Core;

using System;

namespace LocationTool.Loggers
{
    public class ConsoleLogger : ILogger
    {
        public void WriteLine(string value)
        {
            Console.ResetColor();
            Console.BackgroundColor = ConsoleColor.Black;
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine(value);
            Console.ResetColor();
        }

        public void WriteLineSuccess(string value)
        {
            Console.ResetColor();
            Console.BackgroundColor = ConsoleColor.Green;
            Console.ForegroundColor = ConsoleColor.Black;
            Console.WriteLine(value);
            Console.ResetColor();
        }

        public void WriteLineInfo(string value)
        {
            Console.ResetColor();
            Console.BackgroundColor = ConsoleColor.DarkBlue;
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine(value);
            Console.ResetColor();
        }
    }
}