namespace ListaDeAfazeres.Server.Modules.Utils.Model
{

    // BaseModel serve para aplicar campos e métodos que todos os Models devem ter
    public abstract class BaseModel
    {
        public abstract void UpdateFromDto(object updateValues);
    }

}
