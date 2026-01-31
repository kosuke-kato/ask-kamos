import os
import sys
import json
import urllib.request
import urllib.error
import mimetypes
import base64
import datetime

# Configuration
# KAMOS_API_URL = os.environ.get("KAMOS_API_URL", "https://processmcprequest-x2panoolwa-an.a.run.app")
KAMOS_API_URL = os.environ.get("KAMOS_API_URL", "https://processmcprequest-x2panoolwa-an.a.run.app")

def load_env():
    """Simple .env loader to avoid external dependencies"""
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, value = line.split('=', 1)
                    # Simple unquote if needed, though usually not needed for simple tokens
                    key = key.strip()
                    value = value.strip().strip("'").strip('"')
                    os.environ[key] = value


def ask_kamos(prompt, use_google=False, use_rag=False, use_saved=False, image_path=None, silent=False, reset_history=False, include_specs=False):

    load_env()
    token = os.environ.get("KAMOS_API_TOKEN")
    
    if not token:
        if not silent:
            print("Error: KAMOS_API_TOKEN not found in environment variables or .env file.", file=sys.stderr)
        return None

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    payload_data = {
        "prompt": prompt,
        "useGoogleSearch": use_google,
        "includePastArticles": use_rag,
        "includeSavedAnalyses": use_saved,
        "includeKamosSpecs": include_specs
    }

    if image_path:
        mime_type, encoded_data = encode_image(image_path)
        if mime_type and encoded_data:
            payload_data["imageContent"] = {
                "mimeType": mime_type,
                "data": encoded_data
            }
        else:
            return None # Exit if image processing failed
    
    payload = {
        "data": payload_data
    }
    
    try:
        req = urllib.request.Request(
            KAMOS_API_URL, 
            data=json.dumps(payload).encode('utf-8'), 
            headers=headers, 
            method='POST'
        )
        
        display_prompt = prompt
        if len(display_prompt) > 200:
             display_prompt = display_prompt[:200] + " ... (truncated)"
        info_parts = [f"Analyzing: {display_prompt}"]
        if use_google: info_parts.append("[Google Search: ON]")
        if use_rag: info_parts.append("[RAG: ON]")
        if use_saved: info_parts.append("[Saved Data: ON]")
        if include_specs: info_parts.append("[Specs: ON]")
        if image_path: info_parts.append(f"[Image: {os.path.basename(image_path)}]")
        
        if not silent:
            print(" ".join(info_parts) + "...", file=sys.stderr)
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            if "error" in result:
                if not silent:
                    print(f"Error from Kamos: {result['error']}", file=sys.stderr)
                return None
            
            # 1. Merge existing history FIRST before overwriting anything
            # SKIP if reset_history is True
            temp_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.agent', 'temp')
            temp_file = os.path.join(temp_dir, 'kamos_latest.json')
            
            if not reset_history and os.path.exists(temp_file):
                try:
                    with open(temp_file, 'r', encoding='utf-8') as f:
                        old_data = json.load(f)
                        old_res = old_data.get("result", {})
                        old_history = old_res.get("directorHistory", [])
                        if old_history:
                            if "result" not in result: result["result"] = {}
                            result["result"]["directorHistory"] = old_history
                except Exception as e:
                    if not silent: print(f"[DEBUG] History merge failed: {e}", file=sys.stderr)
            elif reset_history:
                 if "result" not in result: result["result"] = {}
                 result["result"]["directorHistory"] = [] # Clear it

            # 2. Output the analysis result nicely to console
            if not silent:
                data = result.get("result", {})
                # Preserve the original user prompt for the viewer UI
                data["userPrompt"] = prompt

                print(f"\n# {data.get('title', 'Analysis Result')}\n")
                
                framework = data.get("framework", {})
                report = data.get("report", {})
                grounding = data.get("groundingMetadata", {})
                debug_desc = data.get("_debugImageDescription")
                
                if debug_desc:
                    print(f"\n[DEBUG] Image Description Used:\n{debug_desc}\n")

                if framework:
                    sections = framework.get("sections", [])
                    if sections:
                        s = sections[0]
                        print(f"## Generated Framework: {s.get('structure_type')}")
                        rows = [r['title'] for r in s.get('rows', [])]
                        cols = [c['title'] for c in s.get('columns', [])]
                        print(f"Axes: {rows} x {cols}\n")
                
                print("## Report\n")
                for key, content in report.items():
                    print(f"### Cell {key}")
                    print(content)
                    print("\n" + "-"*40 + "\n")
                
                if grounding:
                     print("## Sources (Grounding)\n")
                     print(json.dumps(grounding, indent=2, ensure_ascii=False))

            # 3. Final Save (JSON + JS) - Now results AND history are safely combined
            os.makedirs(temp_dir, exist_ok=True)
            try:
                with open(temp_file, 'w', encoding='utf-8') as f:
                    json.dump(result, f, ensure_ascii=False, indent=2)
            except Exception as e:
                if not silent: print(f"[WARN] Failed to save temp JSON: {e}", file=sys.stderr)

            viewer_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.agent', 'viewer')
            os.makedirs(viewer_dir, exist_ok=True)
            data_js_file = os.path.join(viewer_dir, 'data.js')
            try:
                with open(data_js_file, 'w', encoding='utf-8') as f:
                    js_content = f"window.KAMOS_LATEST_DATA = {json.dumps(result, ensure_ascii=False, indent=2)};"
                    f.write(js_content)
            except Exception as e:
                if not silent: print(f"[WARN] Failed to save dashboard JS: {e}", file=sys.stderr)

            return result

            return result

    except urllib.error.HTTPError as e:
        if not silent:
            error_body = e.read().decode('utf-8')
            print(f"HTTP Error {e.code}: {error_body}", file=sys.stderr)
    except Exception as e:
        if not silent:
            print(f"Error: {e}", file=sys.stderr)
    
    return None

def update_director_note(comment, next_prompt=None):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(base_dir, '.agent', 'temp', 'kamos_latest.json')
    js_path = os.path.join(base_dir, '.agent', 'viewer', 'data.js')

    if not os.path.exists(json_path):
        print(f"Notice: {json_path} not found. Skipping note update.", file=sys.stderr)
        return

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Ensure result object exists
        if "result" not in data:
            data["result"] = {}
            
        # Update current Director's Comment
        data["result"]["directorComment"] = comment
        if next_prompt:
             data["result"]["nextPrompt"] = next_prompt

        # Update or add to history entries
        if "directorHistory" not in data["result"]:
            data["result"]["directorHistory"] = []
        
        # Identify the LAST entry to see if we are updating the same result
        # (e.g., if we call update-note multiple times for the same analysis)
        update_existing = False
        if data["result"]["directorHistory"]:
             last_entry = data["result"]["directorHistory"][-1]
             if last_entry.get("title") == data["result"].get("title"):
                  # Update the existing last entry instead of appending
                  last_entry["timestamp"] = datetime.datetime.now().isoformat()
                  last_entry["comment"] = comment
                  last_entry["nextPrompt"] = next_prompt
                  update_existing = True
        
        if not update_existing:
            # We store the "Full State" of this cycle in history
            history_entry = {
                "timestamp": datetime.datetime.now().isoformat(),
                "comment": comment,
                "nextPrompt": next_prompt,
                "title": data["result"].get("title"),
                "userPrompt": data["result"].get("userPrompt"),
                "framework": data["result"].get("framework"),
                "report": data["result"].get("report")
            }
            data["result"]["directorHistory"].append(history_entry)

        # Save JSON
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # Save JS
        with open(js_path, 'w', encoding='utf-8') as f:
            js_content = f"window.KAMOS_LATEST_DATA = {json.dumps(data, ensure_ascii=False, indent=2)};"
            f.write(js_content)
        
        print(f"Director Note Updated (Archived to history).", file=sys.stderr)

    except Exception as e:
        print(f"Error updating director note: {e}", file=sys.stderr)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 ask_kamos.py [options] <prompt>")
        print("       python3 ask_kamos.py --update-note <comment> [--next-prompt <prompt>] [prompt]")
        print("Options:")
        print("  -g, --google      Enable Google Search")
        print("  -r, --rag         Enable RAG (Past Articles)")
        print("  -s, --saved       Enable Saved Analyses Context")
        print("  -i, --image <path> Analyze an image")
        print("  -n, --new         Start a new session (default for plain analysis)")
        print("  -a, --append      Append to existing history (default when using --update-note)")
        print("  -u, --update-note <comment>  Update Director's Note (for previous analysis)")
        print("  --next-prompt <prompt>       Specify Next Prompt for Director's Note")
        print("  --specs                      Include Kamos Framework Specifications (Docs & Design)")
        sys.exit(1)
    
    args = sys.argv[1:]
    use_google = False
    use_rag = False
    use_saved = False
    reset_history_flag = None # None means decide based on other flags
    image_path = None
    update_note_comment = None
    next_prompt_text = None
    include_specs = False
    prompt_parts = []
    
    i = 0
    while i < len(args):
        arg = args[i]
        if arg in ("-g", "--google"):
            use_google = True
        elif arg in ("-r", "--rag"):
            use_rag = True
        elif arg in ("-s", "--saved"):
            use_saved = True
        elif arg in ("-n", "--new", "--reset"):
            reset_history_flag = True
        elif arg in ("-a", "--append"):
            reset_history_flag = False
        elif arg in ("-i", "--image"):
            if i + 1 < len(args):
                image_path = args[i+1]
                i += 1
            else:
                print("Error: --image requires a file path argument.")
                sys.exit(1)
        elif arg in ("-u", "--update-note"):
            if i + 1 < len(args):
                update_note_comment = args[i+1]
                i += 1
            else:
                print("Error: --update-note requires a comment string.")
                sys.exit(1)
        elif arg == "--specs":
            include_specs = True
        elif arg == "--next-prompt":
            if i + 1 < len(args):
                next_prompt_text = args[i+1]
                i += 1
            else:
                print("Error: --next-prompt requires a prompt string.")
                sys.exit(1)
        else:
            prompt_parts.append(arg)
        i += 1
            
    # Final logic for history reset:
    # If not explicitly specified by -n or -a:
    # - If we are updating a note (iterative mode), default to APPEND (False)
    # - Otherwise (starting a fresh topic), default to RESET (True)
    if reset_history_flag is None:
        if update_note_comment:
            reset_history = False
        else:
            reset_history = True
    else:
        reset_history = reset_history_flag

    # Process Note Update FIRST if provided
    if update_note_comment:
        update_director_note(update_note_comment, next_prompt_text)

    # Then process Analysis if prompt is provided
    prompt = " ".join(prompt_parts)
    
    if prompt:
        ask_kamos(prompt, use_google, use_rag, use_saved, image_path, reset_history=reset_history, include_specs=include_specs)
    elif not update_note_comment:
        print("Error: Prompt is required unless updating note.")
        sys.exit(1)

