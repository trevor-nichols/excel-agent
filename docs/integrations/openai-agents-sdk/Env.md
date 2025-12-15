## Environment & Key Handling (Agents SDK)

- **OPENAI_API_KEY**: supply via environment (build-time or injected runtime). Do not hardcode or bundle secrets.  
- **Browser add-in guidance**: prefer ephemeral keys or proxy retrieval; never embed long-lived keys in frontend bundles.  
- **Config surface**: keep model/version and tracing flags centralized (e.g., a config module) to avoid scattering.  
- **Local dev**: use `.env` with tooling that strips it from production bundles.  
- **Rotation**: support key rotation by reloading from env without redeploy where possible.

