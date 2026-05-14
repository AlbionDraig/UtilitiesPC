---
description: "Use when setting up IPC (Inter-Process Communication) between React frontend and Rust backend in Tauri. Covers command invocation, events, type safety, and error handling."
applyTo: "{src/**/*.tsx,src-tauri/src/**/*.rs}"
---

# Tauri IPC Guidelines (Frontend ↔ Backend Communication)

## Command invocation (React → Rust)
Use custom hooks to wrap Tauri commands and manage state:

```typescript
// src/hooks/useApplyProfile.ts
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

interface UseApplyProfileResult {
  loading: boolean;
  error: string | null;
  apply: (profileName: string) => Promise<void>;
}

export function useApplyProfile(): UseApplyProfileResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = async (profileName: string) => {
    setLoading(true);
    setError(null);
    try {
      await invoke("apply_profile", { profileName });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, apply };
}
```

**Rules:**
- Custom hook per command (separation of concerns).
- Hook manages: loading, error, success states.
- Never call `invoke()` directly in components; use the hook.
- Return state and action functions; let component handle UI.

## Events (Rust → React)
Emit events from Rust for long-running tasks or status updates:

**Rust (src-tauri/src/commands/):**
```rust
#[tauri::command]
async fn apply_profile_and_notify(
    profile_name: String,
    app: tauri::AppHandle,
) -> Result<String, String> {
    app.emit("profile_status", "Starting...")?;
    
    // Do work...
    tokio::time::sleep(std::time::Duration::from_secs(2)).await;
    
    app.emit("profile_status", "Complete!")?;
    Ok("Profile applied".to_string())
}
```

**React (src/hooks/useProfileEvents.ts):**
```typescript
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";

export function useProfileStatus() {
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    let unlistener: UnlistenFn;

    (async () => {
      unlistener = await listen("profile_status", (event) => {
        setStatus(event.payload as string);
      });
    })();

    return () => {
      unlistener?.();
    };
  }, []);

  return status;
}
```

## Type safety (Shared models)
Keep Rust models in sync with TypeScript interfaces:

**Rust (src-tauri/src/models.rs):**
```rust
#[derive(Serialize, Deserialize, Debug)]
pub struct ProfileStatus {
    #[serde(rename = "profileName")]
    pub profile_name: String,
    pub is_active: bool,
    pub processes_stopped: usize,
}
```

**TypeScript (src/types/profiles.ts):**
```typescript
export interface ProfileStatus {
  profileName: string;
  isActive: boolean;
  processesStopped: number;
}
```

**Rule:** Names must match (use `#[serde(rename = "...")]` if camelCase differs).

## Error handling (Rust → React)
All command failures reach React as string errors. Handle gracefully:

```typescript
const { apply, error, loading } = useApplyProfile();

const handleApply = async () => {
  try {
    await apply("gamer");
  } catch (err) {
    // Never re-throw; use `error` state from hook
  }
};

// In JSX:
if (error) {
  return <div className="text-error">{error}</div>;
}
```

**Rule:** Never expose Rust stack traces to users. Commands must return user-friendly error messages.

## Permissions (tauri.conf.json)
Only enable permissions needed for the app:

```json
{
  "tauri": {
    "allowlist": {
      "core": {
        "invoke": true,
        "event": true
      },
      "fs": {
        "scope": ["$APPDATA/PerfilesPC/**"]
      },
      "process": {
        "all": false
      },
      "shell": {
        "execute": false,
        "open": false
      }
    }
  }
}
```

**Rules:**
- Invoke + Event always enabled (core IPC).
- `fs`: restrict to specific directories if possible.
- `process`: enable only if needed; keep minimal.
- `shell`: disabled by default.

## Testing IPC flows
**Rust tests:** Mock system calls; test commands return correct types.
**React tests:** Mock `invoke` from `@tauri-apps/api/core`; verify state updates.

```typescript
// src/__tests__/hooks/useApplyProfile.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import { useApplyProfile } from "../../hooks/useApplyProfile";

vi.mock("@tauri-apps/api/core");

describe("useApplyProfile", () => {
  it("sets loading state during invoke", async () => {
    const { result } = renderHook(() => useApplyProfile());

    const promise = result.current.apply("gamer");

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("sets error on invoke failure", async () => {
    vi.mocked(invoke).mockRejectedValueOnce(new Error("Command failed"));

    const { result } = renderHook(() => useApplyProfile());
    await result.current.apply("gamer");

    await waitFor(() => {
      expect(result.current.error).toBe("Command failed");
    });
  });
});
```

## Performance considerations
- Debounce rapid command invocations to prevent user spam.
- Cache read-only data in React state if appropriate (profiles list).
- Emit events for long operations (>500ms) instead of awaiting; improves perceived responsiveness.

## Security in IPC
- Validate all command arguments in Rust before execution.
- Never expose file paths, usernames, or PII in event payloads.
- Sanitize error messages before sending to frontend (remove stack traces, internals).
- Use Tauri permissions (`allowlist`) to restrict frontend-triggered capabilities.
