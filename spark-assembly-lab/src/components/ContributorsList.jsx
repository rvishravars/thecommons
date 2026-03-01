import { Users } from 'lucide-react';

export default function ContributorsList({ contributors, loading }) {
    if (loading && (!contributors || contributors.length === 0)) {
        return (
            <div className="mb-4 rounded-lg border theme-border theme-card-soft p-3 animate-pulse">
                <div className="h-3 w-24 bg-white/10 rounded mb-3"></div>
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 theme-border bg-white/5"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!contributors || contributors.length === 0) {
        return null;
    }

    return (
        <div className="mb-4 rounded-lg border theme-border theme-card-soft p-3 group">
            <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-wider theme-muted font-bold flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-design-400" />
                    Collaborators ({contributors.length})
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                <div className="flex -space-x-2 overflow-hidden hover:space-x-1 transition-all duration-300">
                    {contributors.map((user) => (
                        <a
                            key={user.login}
                            href={user.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative inline-block"
                            title={`@${user.login}`}
                        >
                            <img
                                src={user.avatar_url}
                                alt={user.login}
                                className="h-8 w-8 rounded-full border-2 theme-border hover:border-design-500 hover:z-10 transition-all duration-200"
                            />
                            <span className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-logic-500 border border-black group-hover:block"></span>
                        </a>
                    ))}
                </div>

                <div className="ml-2 flex items-center">
                    {contributors.slice(0, 2).map((user, idx) => (
                        <span key={user.login} className="text-[10px] theme-muted mr-1">
                            {user.login}{idx < Math.min(contributors.length - 1, 1) ? ',' : contributors.length > 2 ? '...' : ''}
                        </span>
                    ))}
                </div>
            </div>

            {/* Decorative Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-design-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg" />
        </div>
    );
}
