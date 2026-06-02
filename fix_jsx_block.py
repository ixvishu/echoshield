import re

app_path = 'd:\\Ecoshield\\Frontend\\src\\App.tsx'
with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_sig = "const renderAiChatAssistant = () => {"
end_sig = "const renderLiveFeedItems = () => ("

start_idx = content.find(start_sig)
end_idx = content.find(end_sig)

new_block = '''const renderAiChatAssistant = () => {
    return (
      <div className="fixed bottom-6 right-6 z-50 font-mono text-xs select-none">
        {/* Chat Bubble Button */}
        {!chatOpen && (
          <button 
            onClick={() => setChatOpen(true)}
            className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl flex items-center justify-center cursor-pointer transition-all border border-blue-500/20 active:scale-95 animate-pulse-slow"
          >
            <Bot className="h-6 w-6" />
          </button>
        )}

        {/* Chat Window */}
        {chatOpen && (
          <div className="bg-[#0b0f17] border border-slate-800 rounded-xl shadow-2xl w-80 sm:w-96 overflow-hidden flex flex-col h-[400px]">
            {/* Chat Header */}
            <div className="bg-[#030712] border-b border-slate-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-white tracking-wide uppercase text-[10px]">EcoShield AI Assistant</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-slate-500 hover:text-white transition-colors cursor-pointer p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-mono text-[10px]">
              {!geminiKey ? (
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
                <>
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={lex }>
                      <div className={max-w-[80%] p-2.5 rounded-lg leading-relaxed }>
                        <div>{msg.text}</div>
                        <div className="text-[8px] text-slate-500 mt-1 text-right">{msg.time}</div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg rounded-bl-none text-slate-500 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Quick Prompts Starter Chips */}
            {geminiKey && chatMessages.length === 1 && (
              <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-900/60 flex flex-wrap gap-1.5">
                <button 
                  onClick={() => handleSendMessage("Check Peenya AQI")}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-2 py-1 rounded text-[9px] text-slate-300 cursor-pointer transition-colors"
                >
                  📍 Peenya AQI
                </button>
                <button 
                  onClick={() => handleSendMessage("Check Bellandur flood level")}
                  className="bg-slate-900 hover:bg-slate-855 border border-slate-800 px-2 py-1 rounded text-[9px] text-slate-300 cursor-pointer transition-colors"
                >
                  💧 Bellandur Lake
                </button>
              </div>
            )}

            {/* Chat Input */}
            {geminiKey && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!chatInput.trim()) return;
                  handleSendMessage(chatInput);
                }}
                className="bg-[#030712] border-t border-slate-800 p-2 flex gap-2"
              >
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your resilience inquiry..." 
                  className="flex-1 bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500/40 text-slate-200"
                />
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded cursor-pointer transition-colors flex items-center justify-center"
                >
                  <Send className="h-3 w-3" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    );
  };

  '''

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_block + content[end_idx:]
    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed JSX block")
else:
    print("Could not find blocks")
