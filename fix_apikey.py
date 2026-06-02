import re

app_path = 'd:\\Ecoshield\\Frontend\\src\\App.tsx'
with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded API key with state variable
content = content.replace(
    'const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY");',
    'const genAI = new GoogleGenerativeAI(geminiKey);'
)

# Add state variable
# Find where other states are declared
state_pos = content.find('const [chatOpen, setChatOpen] = useState(false);')
content = content[:state_pos] + "const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_key') || '');\n  " + content[state_pos:]

# Add UI to ask for key if empty
# Find chat messages render area
chat_render_pos = content.find('{chatMessages.map((msg, i) => (')

key_ui = '''{!geminiKey ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <Lock className="h-8 w-8 text-slate-500 mb-3" />
                <h3 className="text-slate-300 font-bold mb-2">API Key Required</h3>
                <p className="text-slate-500 text-[10px] mb-4">To use the live AI model, enter your Google Gemini API Key.</p>
                <input 
                  type="password"
                  placeholder="Paste API Key here..."
                  className="bg-slate-900 border border-slate-700 rounded p-2 text-xs w-full text-white mb-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val) {
                        localStorage.setItem('gemini_key', val);
                        setGeminiKey(val);
                      }
                    }
                  }}
                />
                <p className="text-[8px] text-slate-600">Press Enter to save. Stored securely in your browser.</p>
              </div>
            ) : (
'''

content = content[:chat_render_pos] + key_ui + content[chat_render_pos:]

# Find the end of the chat messages render area to close the ternary
# It ends with:
#                 </div>
#               ))}
#               {isTyping && (

end_chat_pos = content.find('{isTyping && (')
# Actually let's close it right before {chatMessages.length === 1 && (
end_chat_pos = content.find('{chatMessages.length === 1 && (')

content = content[:end_chat_pos] + ")}\n              " + content[end_chat_pos:]

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated App.tsx to use localStorage for API key")
