using System.Text;
using System.Security.Cryptography;

namespace Hospital.Api.Services.Auth;

public class PasswordService
{
    // Tamaños recomendados
    private const int SaltSize = 32;       // 32 bytes
    private const int HashSize = 64;       // 64 bytes = PBKDF2-SHA256
    private const int DefaultIterations = 100000;

    // Generar hash + salt para una contraseña nueva
    public (byte[] hash, byte[] salt, int iterations) HashPassword(string password)
    {
        // Crear salt aleatorio
        var salt = RandomNumberGenerator.GetBytes(SaltSize);

        // Generar hash usando PBKDF2
        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, DefaultIterations, HashAlgorithmName.SHA256);

        var hash = pbkdf2.GetBytes(HashSize);

        return (hash, salt, DefaultIterations);
    }

    // Validar una contraseña con los valores guardados en BD
    public bool VerifyPassword(string password, byte[] storedHash, byte[] storedSalt, int iterations)
    {
        using var pbkdf2 = new Rfc2898DeriveBytes(password, storedSalt, iterations, HashAlgorithmName.SHA256);

        var hashToCompare = pbkdf2.GetBytes(HashSize);

        return CryptographicOperations.FixedTimeEquals(hashToCompare, storedHash);
    }
}
