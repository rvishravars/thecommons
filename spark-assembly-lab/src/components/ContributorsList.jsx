import { Users } from 'lucide-react';

export default function ContributorsList({ contributors, loading }) {
    if (loading && (!contributors || contributors.length === 0)) {
        return (
            <div className="flex -space-x-1.5 animate-pulse ml-2 pb-2">
                {[1, 2].map(i => (
                    <div key={i} className="h-6 w-6 rounded-full border border-white/10 bg-white/5"></div>
                ))}
            </div>
        );
    }

    if (!contributors || contributors.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 mb-2 ml-1 group animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="flex -space-x-1.5 overflow-hidden">
                {contributors.map((user) => (
                    <a
                        key={user.login}
                        href={user.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative inline-block transition-transform hover:scale-110 hover:z-10 focus:outline-none"
                        title={`Contributor: @${user.login}`}
                    >
                        <img
                            src={user.avatar_url}
                            alt={user.login}
                            className="h-6 w-6 rounded-full border border-theme-border shadow-sm grayscale hover:grayscale-0 transition-all"
                        />
                    </a>
                ))}
            </div>

            {contributors.length > 0 && (
                <span className="text-[10px] theme-muted flex items-center gap-1 opacity-100 transition-opacity">
                    <Users className="h-2.5 w-2.5" />
                    {contributors.length} {contributors.length === 1 ? 'collaborator' : 'collaborators'}
                </span>
            )}
        </div>
    );
}
