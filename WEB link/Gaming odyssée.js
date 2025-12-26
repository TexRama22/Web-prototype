import React, { useState, useEffect } from 'react';
import { Camera, Gamepad2, Heart, Share2, Upload, Calendar, User, X, ChevronRight, Trophy, Sparkles, Wand2, Loader2 } from 'lucide-react';

const GamingJourney = () => {
  // --- CONFIGURATION GEMINI API ---
  const apiKey = ""; // La clé API sera injectée automatiquement par l'environnement
  
  const callGemini = async (prompt) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Erreur Gemini:", error);
      return null;
    }
  };

  // Données initiales pour peupler la galerie
  const initialPosts = [
    {
      id: 1,
      user: "RetroFan88",
      game: "Super Mario World",
      year: "1990",
      image: "https://images.unsplash.com/photo-1566576912902-1d6ebc123d7d?auto=format&fit=crop&q=80&w=800",
      story: "Le premier jeu que j'ai fini à 100%. La cape plume reste mon power-up préféré de tous les temps !",
      likes: 142,
      tags: ["Retro", "Platformer"]
    },
    {
      id: 2,
      user: "SpeedRunner_X",
      game: "The Legend of Zelda: Ocarina of Time",
      year: "1998",
      image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=800",
      story: "La première fois que j'ai vu la plaine d'Hyrule s'ouvrir devant moi... un sentiment de liberté inégalé.",
      likes: 89,
      tags: ["Adventure", "N64"]
    },
    {
      id: 3,
      user: "CyberNinja",
      game: "Halo 3",
      year: "2007",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
      story: "Les nuits blanches en écran scindé avec les potes. Le mode Forge a changé ma vie.",
      likes: 205,
      tags: ["FPS", "Multiplayer"]
    },
    {
      id: 4,
      user: "EldenLord",
      game: "Elden Ring",
      year: "2022",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
      story: "Après 100 heures, je découvre encore des zones secrètes. L'arbre-monde est magnifique.",
      likes: 310,
      tags: ["RPG", "Modern"]
    }
  ];

  const [posts, setPosts] = useState(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("Tous");
  
  // États pour l'IA
  const [isGeneratingFact, setIsGeneratingFact] = useState(false);
  const [isEnhancingStory, setIsEnhancingStory] = useState(false);

  const [newPost, setNewPost] = useState({
    user: '',
    game: '',
    year: '',
    story: '',
    image: null,
    previewUrl: ''
  });

  // Gestion des likes
  const handleLike = (id) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  // Gestion du formulaire d'upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewPost({ ...newPost, image: file, previewUrl: url });
    }
  };

  // --- FONCTIONS IA ---

  const generateGameFact = async () => {
    if (!newPost.game) return;
    setIsGeneratingFact(true);
    
    const prompt = `Tu es une encyclopédie du jeu vidéo. Donne-moi une anecdote courte, fascinante et peu connue (le "saviez-vous ?") sur le jeu vidéo "${newPost.game}". Réponds en Français, en une ou deux phrases maximum. Ne mets pas de guillemets.`;
    
    const fact = await callGemini(prompt);
    
    if (fact) {
      const currentStory = newPost.story ? newPost.story + "\n\n" : "";
      setNewPost({ ...newPost, story: currentStory + "Saviez-vous que : " + fact });
    }
    setIsGeneratingFact(false);
  };

  const enhanceStory = async () => {
    if (!newPost.story) return;
    setIsEnhancingStory(true);

    const prompt = `Tu es un écrivain spécialisé dans le gaming et la nostalgie. Réécris le texte suivant pour le rendre plus épique, émotionnel ou immersif, tout en gardant le sens original. Le texte est un souvenir d'un joueur.
    
    Texte original: "${newPost.story}"
    
    Réponds uniquement avec le texte amélioré en Français.`;

    const enhanced = await callGemini(prompt);

    if (enhanced) {
      setNewPost({ ...newPost, story: enhanced });
    }
    setIsEnhancingStory(false);
  };

  // --------------------

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPost.game || !newPost.story) return;

    const postToAdd = {
      id: Date.now(),
      user: newPost.user || "Anonyme",
      game: newPost.game,
      year: newPost.year || new Date().getFullYear(),
      image: newPost.previewUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
      story: newPost.story,
      likes: 0,
      tags: ["Communauté"]
    };

    setPosts([postToAdd, ...posts]);
    setIsModalOpen(false);
    setNewPost({ user: '', game: '', year: '', story: '', image: null, previewUrl: '' });
  };

  // Filtrage
  const filteredPosts = filter === "Tous" 
    ? posts 
    : posts.filter(post => {
        if (filter === "Retro") return parseInt(post.year) < 2005;
        if (filter === "Moderne") return parseInt(post.year) >= 2005;
        return true;
      });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="h-8 w-8 text-purple-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                GamingOdyssey
              </span>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-purple-500/20"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Partager mon histoire</span>
              <span className="sm:hidden">Partager</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Chaque joueur a une <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">Histoire</span>.
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Une chronologie visuelle des jeux qui ont marqué nos vies. Des pixels des années 80 à la 4K d'aujourd'hui, partagez votre moment inoubliable.
          </p>
          
          {/* Filtres */}
          <div className="flex justify-center space-x-4 mb-12">
            {["Tous", "Retro", "Moderne"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f 
                    ? "bg-slate-100 text-slate-900" 
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Galerie */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <div key={post.id} className="group relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
              
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-60"></div>
                <img 
                  src={post.image} 
                  alt={post.game} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 z-20 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-xs font-mono border border-slate-700">
                  {post.year}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 relative z-20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                      {post.game}
                    </h3>
                    <div className="flex items-center text-sm text-slate-400 mt-1">
                      <User className="h-3 w-3 mr-1" />
                      {post.user}
                    </div>
                  </div>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed mb-6 line-clamp-3 whitespace-pre-line">
                  "{post.story}"
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div className="flex space-x-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-slate-700 rounded text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-pink-500 transition-colors group/like"
                  >
                    <Heart className={`h-5 w-5 ${post.likes > 0 ? 'fill-pink-500/20 text-pink-500' : ''} group-hover/like:fill-pink-500 group-hover/like:scale-110 transition-transform`} />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal d'ajout */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 shrink-0">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Nouveau Souvenir
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              
              {/* Upload Image */}
              <div className="relative group cursor-pointer shrink-0">
                <div className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center transition-colors ${newPost.previewUrl ? 'border-purple-500 bg-slate-800' : 'border-slate-600 hover:border-slate-400 hover:bg-slate-800'}`}>
                  {newPost.previewUrl ? (
                    <img src={newPost.previewUrl} alt="Preview" className="h-full w-full object-cover rounded-lg opacity-80" />
                  ) : (
                    <>
                      <Camera className="h-8 w-8 text-slate-400 mb-2 group-hover:text-purple-400" />
                      <span className="text-sm text-slate-400 group-hover:text-slate-200">Cliquez pour ajouter une image</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Jeu Vidéo</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Final Fantasy VII"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-4 pr-10 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      value={newPost.game}
                      onChange={(e) => setNewPost({...newPost, game: e.target.value})}
                    />
                    {newPost.game && (
                      <button
                        type="button"
                        onClick={generateGameFact}
                        disabled={isGeneratingFact}
                        title="Générer une anecdote IA"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 disabled:opacity-50"
                      >
                        {isGeneratingFact ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Année</label>
                  <input 
                    type="number" 
                    placeholder="1997"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    value={newPost.year}
                    onChange={(e) => setNewPost({...newPost, year: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Votre Pseudo</label>
                <input 
                  type="text" 
                  placeholder="Gamer123"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  value={newPost.user}
                  onChange={(e) => setNewPost({...newPost, user: e.target.value})}
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-xs font-medium text-slate-400 uppercase">Votre Histoire</label>
                  {newPost.story.length > 5 && (
                    <button
                      type="button"
                      onClick={enhanceStory}
                      disabled={isEnhancingStory}
                      className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                    >
                      {isEnhancingStory ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                      ✨ Améliorer avec l'IA
                    </button>
                  )}
                </div>
                <textarea 
                  required
                  placeholder="Racontez pourquoi ce jeu vous a marqué..."
                  rows="4"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                  value={newPost.story}
                  onChange={(e) => setNewPost({...newPost, story: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-purple-900/20 transform transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 shrink-0"
              >
                <Upload className="h-5 w-5" />
                Publier le souvenir
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-800 text-center">
        <p className="text-slate-500 flex items-center justify-center gap-2">
          Fait avec <Heart className="h-4 w-4 text-red-500 fill-red-500" /> pour les gamers par l'IA.
        </p>
      </footer>

    </div>
  );
};

export default GamingJourney;