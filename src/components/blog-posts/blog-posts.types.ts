type BlogPost = {
    excerpt: string;
    frontmatter: {
        title: string;
        published: string;
        slug: string;
    };
};

type BlogPosts = BlogPost[];

export type { BlogPost, BlogPosts };
