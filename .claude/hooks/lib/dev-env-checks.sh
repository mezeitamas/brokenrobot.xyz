#!/usr/bin/env bash
# Shared dev-environment diagnostics — the detection half of bringing a checkout up to speed.
#
# Two consumers, one implementation, so the probes cannot drift apart:
#   - .claude/hooks/session-start.sh sources this file and ACTS on what it finds — it installs
#     dependencies and builds the Codegraph index;
#   - the checking-dev-env skill executes it directly (`bash .claude/hooks/lib/dev-env-checks.sh`)
#     and only GUIDES — executed mode runs every check read-only, prints the ✓/✗ report, and
#     exits 1 when anything needs attention. It never installs, builds, or edits anything.
#
# Drift contract: symptom detection and ✗-line wording live here; the canonical remediation lives
# in docs/development-environment.md § Troubleshooting, keyed on the ✗ lines' prefixes. A ✗ line
# may inline a one-line copy of its fix for hook-only readers — keep any such copy, and the two
# files, in step.
#
# Written to be sourced under `set -uo pipefail`: it defines functions and accumulator globals,
# nothing else, and never exits the caller.

# --- Toolchain ----------------------------------------------------------------------------------
#     Healthy tools share one ✓ line; each problem gets its own ✗ line with the consequence
#     spelled out. Fills the have_* globals the callers gate their later steps on, so a report
#     never implies work that never ran.
#
#     mise.toml is the only place tool versions are pinned, and mise is a required tool, so the
#     version check is mise's own answer: which pins are not installed. The presence checks after
#     it catch a pinned tool that is installed but not on this PATH — mise not active in the shell
#     that started Claude Code.
have_node=false
have_npm=false
have_jq=false
have_codegraph=false
ok_parts=""
problems=""
tool_ok() { ok_parts="${ok_parts}${ok_parts:+, }$1"; }
tool_bad() { problems="${problems}${problems:+$'\n'}✗ $1"; }

dev_env_check_tools() {
    have_node=false
    have_npm=false
    have_jq=false
    have_codegraph=false
    ok_parts=""
    problems=""
    local fix="mise install, then start Claude Code from a shell with mise activated"

    if command -v git >/dev/null; then
        tool_ok "git $(git --version | awk '{print $3}')"
    else
        tool_bad "git missing — the lockfile stamp cannot be computed, so dependencies reinstall every session"
    fi

    # `mise ls --current --missing` prints one line per pin that is not installed, and nothing when
    # all are; it exits non-zero only when it cannot read the config (an untrusted mise.toml, say).
    local missing tool version
    if command -v mise >/dev/null; then
        if missing="$(mise ls --current --missing --no-header 2>/dev/null)"; then
            if [ -z "${missing}" ]; then
                tool_ok "mise $(mise --version | awk '{print $1}') (all pins installed)"
            else
                while read -r tool version _; do
                    tool_bad "${tool} ${version} not installed — mise.toml pins it; mise install"
                done <<<"${missing}"
            fi
        else
            tool_bad "mise cannot read mise.toml — no pinned tool can be installed; run mise install to see the error"
        fi
    else
        tool_bad "mise missing — the project's tools cannot be installed; see docs/development-environment.md § Toolchain (mise)"
    fi

    if command -v node >/dev/null; then
        have_node=true
        tool_ok "node $(node --version)"
    else
        tool_bad "node missing — dependencies cannot be installed; ${fix}"
    fi

    if command -v npm >/dev/null; then
        have_npm=true
        tool_ok "npm $(npm --version)"
    else
        tool_bad "npm missing — dependencies cannot be installed; ${fix}"
    fi

    if command -v jq >/dev/null; then
        have_jq=true
        tool_ok "jq"
    else
        tool_bad "jq missing — the session report degrades to plain text and the codegraph health probe cannot be parsed; ${fix}"
    fi

    if command -v codegraph >/dev/null; then
        have_codegraph=true
        tool_ok "codegraph"
    else
        tool_bad "codegraph missing — no index is built and the codegraph MCP server cannot start; ${fix}"
    fi

    if command -v typescript-language-server >/dev/null; then
        tool_ok "typescript-language-server"
    else
        tool_bad "typescript-language-server missing — the typescript-lsp plugin has no server and silently degrades; ${fix}"
    fi

    # The workflow profile is machine-global (~/.config/openspec/config.json): the committed /opsx
    # integration is the six-workflow core set, and on any other profile `openspec update`
    # regenerates a different subset and leaves the rest stale. `config get profile` answers `core`
    # when the key was never set.
    local openspec_ver openspec_profile
    if command -v openspec >/dev/null; then
        openspec_ver="$(openspec --version 2>/dev/null)"
        openspec_profile="$(openspec config get profile 2>/dev/null)"
        if [ "${openspec_profile}" = "core" ]; then
            tool_ok "openspec ${openspec_ver} (profile core)"
        else
            tool_ok "openspec ${openspec_ver}"
            tool_bad "openspec profile is ${openspec_profile:-unknown} but the committed /opsx integration is the six-workflow core set — openspec update on this machine regenerates a different subset and leaves the rest stale; openspec config profile core"
        fi
    else
        tool_bad "openspec missing — the /opsx commands and openspec-* skills fail at their first CLI call; ${fix}"
    fi
}

dev_env_tool_report() { # $1 = pointer suffix appended to each ✗ line, e.g. "(see docs/…)"; "" for none
    local suffix="${1:-}" problem
    suffix="${suffix:+ ${suffix}}"
    [ -z "${ok_parts}" ] || printf '✓ tools: %s\n' "${ok_parts}"
    [ -z "${problems}" ] && return 0
    while IFS= read -r problem; do
        printf '%s%s\n' "${problem}" "${suffix}"
    done <<<"${problems}"
}

# --- Dependencies -------------------------------------------------------------------------------
#     True when node_modules matches the committed lockfile. The stamp holds the lockfile's git
#     hash and lives inside node_modules/, so an install that died partway can never leave a tree
#     that looks complete. No hash (missing lockfile or git) means "not fresh". Prints nothing.
dev_env_deps_fresh() {
    local lock_hash
    lock_hash="$(git hash-object package-lock.json)"
    [ -n "${lock_hash}" ] && [ "$(cat node_modules/.session-start-stamp 2>/dev/null)" = "${lock_hash}" ]
}

# --- Codegraph index ----------------------------------------------------------------------------
#     `status` is the health probe rather than a test for the .codegraph/ directory, which only
#     ever proved a directory existed. Its three answers are distinct — exit 1 when the database
#     cannot be read, initialized:false when there is no index, and reindexRecommended when the
#     index predates the installed codegraph's extraction version. Anything unparseable is treated
#     as unreadable, which is the safe reading of "no usable answer". Requires codegraph and jq.
dev_env_codegraph_state() { # echoes: healthy | uninitialized | reindex | unreadable
    local status_json initialized reindex
    status_json="$(codegraph status --json)"
    initialized="$(printf '%s' "${status_json}" | jq -r '.initialized' 2>/dev/null)"
    reindex="$(printf '%s' "${status_json}" | jq -r '.index.reindexRecommended' 2>/dev/null)"
    if [ "${initialized}" = "true" ] && [ "${reindex}" != "true" ]; then
        echo healthy
    elif [ "${initialized}" = "false" ]; then
        echo uninitialized
    elif [ "${initialized}" = "true" ]; then
        echo reindex
    else
        echo unreadable
    fi
}

# --- Claude Code integration (executed mode only — the hook cannot fix these, so it never asks) --
dev_env_check_claude() { # requires jq; returns 1 on any ✗
    local ok="" bad="" rc=0
    if jq -e '.enabledPlugins["typescript-lsp@claude-plugins-official"] == true' .claude/settings.json >/dev/null 2>&1; then
        ok="typescript-lsp plugin enabled"
    else
        bad="✗ typescript-lsp plugin not enabled — Claude Code runs without TypeScript language intelligence"
    fi
    # Both halves are committed: .mcp.json registers the server, .claude/settings.json enables it.
    # Deliberately NOT settings.local.json — that file is gitignored and sandbox-denied for reads, so
    # probing it always fails from the sandboxed shell the checking-dev-env skill runs in, whatever
    # it holds. A per-machine opt-in cannot be verified here; a committed one can.
    if jq -e '.mcpServers.codegraph' .mcp.json >/dev/null 2>&1 &&
        jq -e '.enabledMcpjsonServers | index("codegraph")' .claude/settings.json >/dev/null 2>&1; then
        ok="${ok}${ok:+, }codegraph MCP enabled"
    else
        bad="${bad}${bad:+$'\n'}✗ codegraph MCP not enabled — it must be in .mcp.json and in enabledMcpjsonServers of .claude/settings.json"
    fi
    [ -z "${ok}" ] || printf '✓ claude code: %s\n' "${ok}"
    if [ -n "${bad}" ]; then
        printf '%s\n' "${bad}"
        rc=1
    fi
    return "${rc}"
}

# --- Containers — needed solely for the e2e/visual-regression suite. Read-only, so the hook reports
#     it too; nothing gates on it. ---------------------------------------------------------------
dev_env_check_containers() { # returns 1 on any ✗
    local ok="" bad="" rc=0 docker_ver devcontainer_cli
    # `docker --version` needs no daemon, so a stopped daemon still credits the installed CLI and
    # the ✗ line names only the half that failed. Output form: "Docker version 29.8.2, build …".
    if command -v docker >/dev/null; then
        docker_ver="$(docker --version 2>/dev/null | awk '{print $3}')"
        docker_ver="${docker_ver%,}"
        if docker info --format '{{.ServerVersion}}' >/dev/null 2>&1; then
            ok="docker ${docker_ver:-present} (daemon running)"
        else
            ok="docker ${docker_ver:-present}"
            bad="✗ docker daemon not running — start Docker Desktop before using the devcontainer/e2e suite"
        fi
    else
        bad="✗ docker missing — the devcontainer and the e2e/visual-regression suite cannot run; day-to-day host development is unaffected"
    fi
    devcontainer_cli=""
    if [ -x node_modules/.bin/devcontainer ]; then
        devcontainer_cli="node_modules/.bin/devcontainer"
    elif command -v devcontainer >/dev/null; then
        devcontainer_cli="devcontainer"
    fi
    if [ -n "${devcontainer_cli}" ]; then
        local devcontainer_ver
        devcontainer_ver="$("${devcontainer_cli}" --version 2>/dev/null)"
        ok="${ok}${ok:+, }devcontainer CLI ${devcontainer_ver:-present}"
    else
        bad="${bad}${bad:+$'\n'}✗ devcontainer CLI missing — it ships as a devDependency, so install dependencies first; only the e2e suite needs it"
    fi
    [ -z "${ok}" ] || printf '✓ containers: %s\n' "${ok}"
    if [ -n "${bad}" ]; then
        printf '%s\n' "${bad}"
        rc=1
    fi
    return "${rc}"
}

# --- Executed mode: the read-only audit the checking-dev-env skill runs. ---------------------------
dev_env_main() {
    cd "${CLAUDE_PROJECT_DIR:-$PWD}" || {
        printf '✗ cannot enter %s — nothing was checked\n' "${CLAUDE_PROJECT_DIR:-$PWD}"
        return 1
    }
    local rc=0

    dev_env_check_tools
    dev_env_tool_report ""
    [ -z "${problems}" ] || rc=1

    if [ "${have_node}" = true ] && [ "${have_npm}" = true ]; then
        if dev_env_deps_fresh; then
            echo "✓ dependencies: fresh (lockfile unchanged since the last install)"
        else
            echo "✗ dependencies: node_modules missing or stale — builds, tests and mise tasks will misbehave"
            rc=1
        fi
    else
        echo "✗ dependencies: not checked (node or npm missing)"
        rc=1
    fi

    if [ "${have_codegraph}" = true ] && [ "${have_jq}" = true ]; then
        case "$(dev_env_codegraph_state)" in
            healthy) echo "✓ codegraph: index present and readable" ;;
            uninitialized)
                echo "✗ codegraph: no index in this checkout — code-intelligence queries have nothing to read"
                rc=1
                ;;
            reindex)
                echo "✗ codegraph: index built by an older codegraph — a rebuild is recommended"
                rc=1
                ;;
            *)
                echo "✗ codegraph: index unreadable — it cannot be queried"
                rc=1
                ;;
        esac
    else
        echo "✗ codegraph: not checked (codegraph or jq missing)"
        rc=1
    fi

    if [ "${have_jq}" = true ]; then
        dev_env_check_claude || rc=1
    else
        echo "✗ claude code integration: not checked (jq missing)"
        rc=1
    fi

    dev_env_check_containers || rc=1

    return "${rc}"
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
    set -uo pipefail
    dev_env_main
fi
