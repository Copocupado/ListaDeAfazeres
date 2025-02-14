namespace ListaDeAfazeres.Server.Modules.Utils.Service
{
    public class BaseServiceException : Exception
    {
        public BaseServiceException() { }

        public BaseServiceException(string message) : base(message) { }

        public BaseServiceException(string message, Exception innerException) : base(message, innerException) { }
    }

}
