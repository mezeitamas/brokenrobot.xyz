import { useCallback } from 'react';

import { ArrowDown } from 'react-feather';

type RecentPostsButtonProps = {
    scrollToPostsSectionId: string;
};

const RecentPostsButton = ({ scrollToPostsSectionId }: RecentPostsButtonProps) => {
    const scrollToPosts = useCallback(() => {
        const recentPostsSection = document.getElementById(scrollToPostsSectionId);

        if (recentPostsSection !== null) {
            recentPostsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, [scrollToPostsSectionId]);

    return (
        <button
            onClick={scrollToPosts}
            className="group flex h-12 min-h-12 shrink-0 cursor-pointer flex-wrap items-center justify-center gap-2 rounded-xl border border-solid border-black px-4 text-center hover:bg-slate-100"
        >
            <span>Recent posts</span>
            <span className="transition-transform group-hover:translate-y-1">
                <ArrowDown size={16} />
            </span>
        </button>
    );
};

export { RecentPostsButton };
