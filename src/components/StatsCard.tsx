import { Trophy, Target, TrendingUp, Calendar } from 'lucide-react'

interface GameStats {
  totalGames: number
  bestScore: number
  averageScore: number
  correctAnswers: number
  totalAnswers: number
}

interface StatsCardProps {
  stats: GameStats
}

export const StatsCard = ({ stats }: StatsCardProps) => {
  const accuracy = stats.totalAnswers > 0 ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0
  
  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center mb-6">
        <Trophy className="w-6 h-6 mr-3 text-spotify-green" />
        <h2 className="text-xl font-semibold">Estadísticas</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-white/5 rounded-xl">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-spotify-green">{stats.bestScore}</div>
          <div className="text-sm text-gray-300">Mellor puntuación</div>
        </div>

        <div className="text-center p-4 bg-white/5 rounded-xl">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-spotify-green">{stats.totalGames}</div>
          <div className="text-sm text-gray-300">Partidas xogadas</div>
        </div>

        <div className="text-center p-4 bg-white/5 rounded-xl">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-spotify-green">{stats.averageScore}</div>
          <div className="text-sm text-gray-300">Media</div>
        </div>

        <div className="text-center p-4 bg-white/5 rounded-xl">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-spotify-green">{accuracy}%</div>
          <div className="text-sm text-gray-300">Precisión</div>
        </div>
      </div>

      {stats.totalGames > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-spotify-green/20 to-green-400/20 rounded-xl border border-spotify-green/30">
          <div className="text-center">
            <div className="text-sm text-gray-300 mb-1">Progreso total</div>
            <div className="text-lg font-semibold">
              {stats.correctAnswers} de {stats.totalAnswers} cancións adiviñadas
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-spotify-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${accuracy}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
