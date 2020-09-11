using System.Collections.Generic;

namespace LocationTool.Core
{
    public interface IWriter<T>
    {
        void Write(T output);
    }
}