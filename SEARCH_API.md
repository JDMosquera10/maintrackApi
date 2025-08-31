# API de Búsqueda de Máquinas

## Endpoint de Búsqueda

### GET /api/machines/search

Permite buscar máquinas por cualquier propiedad usando un término de búsqueda.

#### Parámetros de Query

- `q` (string, requerido): Término de búsqueda. Busca en todas las propiedades de la máquina.

#### Propiedades de búsqueda

La búsqueda se realiza en las siguientes propiedades:
- **model**: Modelo de la máquina
- **serialNumber**: Número de serie
- **client**: Cliente
- **location**: Ubicación
- **status**: Estado de la máquina
- **usageHours**: Horas de uso (solo si el query es un número)

#### Características de la búsqueda

- **Case-insensitive**: No distingue entre mayúsculas y minúsculas
- **Búsqueda parcial**: Encuentra coincidencias parciales
- **Búsqueda numérica**: Si el query es un número, también busca por horas de uso exactas

#### Ejemplos de uso

```bash
# Buscar por modelo
GET /api/machines/search?q=excavadora

# Buscar por número de serie
GET /api/machines/search?q=EXC-2024-001

# Buscar por cliente
GET /api/machines/search?q=constructora

# Buscar por ubicación
GET /api/machines/search?q=bogota

# Buscar por estado
GET /api/machines/search?q=operational

# Buscar por horas de uso (número exacto)
GET /api/machines/search?q=1500
```

#### Respuesta exitosa

```json
{
  "success": true,
  "payload": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "model": "Excavadora CAT 320",
      "serialNumber": "EXC-2024-001",
      "usageHours": 1500,
      "client": "Constructora ABC",
      "location": "Bogotá",
      "status": "OPERATIONAL",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "message": "Found 1 machines matching \"excavadora\""
}
```

#### Respuesta de error

```json
{
  "success": false,
  "error": "Search query parameter \"q\" is required"
}
```

#### Códigos de estado

- `200`: Búsqueda exitosa
- `400`: Parámetro de búsqueda faltante o inválido
- `401`: No autenticado
- `403`: No autorizado (se requiere rol de técnico o superior)
- `500`: Error interno del servidor

#### Autenticación

Este endpoint requiere autenticación y al menos rol de técnico. 