# CryptoSim - Simulador de Trading de Criptomonedas

Un simulador de trading de criptomonedas educativo construido con Next.js 15, Supabase y Tailwind CSS. Practica trading con $10,000 USD virtuales sin riesgo real.

## Caracteristicas

- **Trading Demo** - Opera BTC, ETH, SOL, BNB y mas criptomonedas con dinero virtual
- **Graficos en Tiempo Real** - Velas japonesas con datos de Binance via WebSocket
- **Take Profit / Stop Loss** - Configura TP/SL directamente desde el grafico
- **Asistente IA** - Chatbot educativo en espanol para aprender trading
- **Historial de Transacciones** - Registro completo de todas tus operaciones
- **Portafolio** - Visualiza tus holdings y P&L en tiempo real
- **Membresias** - Planes Free/Premium/Pro con diferentes funciones
- **Autenticacion Segura** - Login con Supabase Auth

## Tecnologias

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Graficos**: lightweight-charts (TradingView)
- **IA**: Vercel AI SDK 6 con AI Gateway (openai/gpt-4o-mini)

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/mercuryblade/proyecto.git
cd proyecto
git checkout cryptosim-nextjs-improvement
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raiz del proyecto:

```env
# Supabase (requerido)
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

Obtén las credenciales de Supabase desde: https://supabase.com/dashboard -> Project Settings -> API

**Nota sobre IA**: El asistente de IA utiliza Vercel AI Gateway con el modelo `openai/gpt-4o-mini`, que funciona automáticamente en proyectos desplegados en Vercel sin configuración adicional.

### 4. Configurar la base de datos

Ejecuta los siguientes scripts SQL en el SQL Editor de Supabase (en orden):

1. `scripts/001_create_tables.sql` - Crea las tablas y politicas RLS
2. `scripts/002_seed_cryptocurrencies.sql` - Inserta datos de criptomonedas
3. `scripts/003_add_tpsl_columns.sql` - Agrega columnas de TP/SL

### 5. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

## Estructura del Proyecto

```
/app
  /api
    /chat          # API del asistente IA
    /trade         # API de ordenes de trading
  /auth            # Paginas de autenticacion
  /dashboard       # Panel principal
    /trade         # Interfaz de trading
    /history       # Historial de transacciones
    /portfolio     # Portafolio de activos
    /assistant     # Chat con IA
    /membership    # Planes de membresia

/components
  /dashboard       # Componentes del dashboard
    price-chart.tsx       # Grafico de velas interactivo
    order-form.tsx        # Formulario de ordenes
    trading-interface.tsx # Interfaz completa de trading
    sidebar.tsx           # Menu lateral
    header.tsx            # Encabezado

/lib
  /supabase        # Configuracion de Supabase
  types.ts         # Tipos TypeScript

/scripts           # Migraciones SQL
```

## Uso

1. **Crear cuenta** - Registrate con email y contrasena
2. **Explorar el Dashboard** - Ve tu balance y resumen del mercado
3. **Operar** - Ve a "Operar" para comprar/vender criptomonedas
4. **Configurar TP/SL** - Haz clic en el grafico para establecer niveles
5. **Aprender** - Usa el asistente IA para resolver dudas sobre trading

## Membresias

| Plan | Saldo Virtual | Mensajes IA/dia | Funciones |
|------|---------------|-----------------|-----------|
| Gratis | $10,000 | 10 | Basicas |
| Premium | $50,000 | Ilimitado | + Alertas, Indicadores |
| Pro | $100,000 | Ilimitado | + Backtesting, IA Predictiva |

## Roadmap

- [ ] Mas criptomonedas (PEPE, SHIB, etc.)
- [ ] Indicadores tecnicos (RSI, MACD, Bollinger)
- [ ] Alertas de precio por email
- [ ] Backtesting de estrategias
- [ ] Integracion con APIs de noticias
- [ ] Modo competencia (leaderboard)
- [ ] App movil (React Native)

## Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcion`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcion'`)
4. Push a la rama (`git push origin feature/nueva-funcion`)
5. Abre un Pull Request

## Licencia

MIT

## Soporte

Si tienes problemas o preguntas, abre un Issue en GitHub.

---

**Nota**: Este es un simulador educativo. Todo el trading se realiza con dinero virtual. No des consejos financieros reales ni promuevas inversiones arriesgadas.
