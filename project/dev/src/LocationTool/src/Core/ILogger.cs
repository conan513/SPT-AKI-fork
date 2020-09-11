namespace LocationTool.Core
{
    public interface ILogger
    {
        void WriteLine(string value);
        void WriteLineSuccess(string value);
        void WriteLineInfo(string value);
    }
}