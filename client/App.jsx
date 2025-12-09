import { useState, useEffect } from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';
import IdeaForm from './components/IdeaForm';
import PostCard from './components/PostCard';

function App() {
  const [idea, setIdea] = useState('');
  const [geminiApiKey] = useState('AIzaSyC-glKxgH_kqvjez7Z4Kyp0nak3ikCLIEs');
  const [generatedPost, setGeneratedPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      setAuthSuccess(true);
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setAuthSuccess(false), 5000);
    }
  }, []);

  const handleGeneratePost = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Create an engaging social media post based on this idea: ${idea}. Make it catchy, informative, and suitable for platforms like Twitter or LinkedIn. Keep it concise but impactful.`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || 'Failed to generate content. Please check your API key.';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate content';

      setGeneratedPost({
        idea,
        content,
        timestamp: new Date().toISOString(),
      });

      setIdea('');
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        setError('Network error. This might be a CORS issue with the Gemini API. Try checking your API key or network connection.');
      } else {
        setError(err.message || 'An error occurred');
      }
      console.error('Error details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {authSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-800 font-medium">Successfully connected to X! You can now share posts directly.</p>
          </div>
        )}

        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-3">
            AI Post Generator
          </h1>
          <p className="text-lg text-slate-600">
            Transform your ideas into engaging social media posts with AI
          </p>
        </div>

        <IdeaForm
          idea={idea}
          loading={loading}
          error={error}
          onIdeaChange={setIdea}
          onSubmit={handleGeneratePost}
        />

        {generatedPost && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">
              Generated Post
            </h2>
            <PostCard post={generatedPost} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
