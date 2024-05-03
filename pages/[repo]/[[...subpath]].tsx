import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import { marked } from "marked";
import hljs from "highlight.js";
import hljsZig from "../../utils/zig";
import { LineFocusPlugin } from "highlightjs-focus";
import "highlight.js/styles/base16/equilibrium-light.css";
import Link from "next/link";
import { DataService } from "../../utils/data";
import { CommonSEO } from "../../components/SEO";
import { base64_encode } from "../../utils/base64";
import { SITE_URL } from "../../utils/consts";
import fs from "fs";

// hljs.registerLanguage("zig", hljsZig);

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  let repo = context.params?.repo ?? null;
  let rest = context.params?.subpath ?? null;

  let subpath = "";
  let reload = false;
  if (rest?.length) {
    subpath = rest[0];
    reload = !!rest[1];
  }

  let markdown = "";
  let postTitle = "";

  if (subpath === "__devmode") {
    markdown = fs.readFileSync("TEST.md", "utf-8");
    return {
      props: { markdown, postTitle, repo, subpath },
    };
  }

  const days = await DataService.allPosts();
  if (subpath) {
    // Subpath is requested
    console.log("subpath: ", subpath, days);
    const matchedIndex = days.findIndex((day) => day?.slug.match(subpath));
    if (matchedIndex !== -1) {
      // Found the matched post
      const matchedDay = days[matchedIndex];
      postTitle = matchedDay?.title ?? "";
      // const postDate = matchedDay.
      // const [postedDate, displayTitle] = postTitle.split(" - ");
      const postedDate = "2024, Dec - 20";
      const displayTitle = postTitle;
      markdown = `\n\n# ${displayTitle}\n<div class="desc text-stone-500 font-mono text-sm">Posted On ${postedDate}</div>\n\n${matchedDay!.tokens.join(
        ""
      )}`;
      const otherStart = Math.max(matchedIndex - 3, 0);
      const otherEnd = otherStart + 6;
      let linkToOthers = days
        .slice(otherStart, otherEnd)
        .filter((day) => day?.slug !== matchedDay?.slug);
      let linkToOthersMarkdown = linkToOthers.map(
        (link) => `- [${link?.title}](/${repo}/${link?.slug})`
      );
      markdown +=
        "\n\n" +
        `<hr/><div class="related-links"><div class="no-counter font-bold font-mono text-sm mb-3">Read more</div>\n\n${linkToOthersMarkdown.join(
          "\n"
        )}</div>`;
    } else {
      // Post not found
      markdown = `Hey! Look like you have lost your way, consider [going back](/${repo})?`;
    }
  } else {
    // List all posts
    if (repo === "blogs") {
      type PostEntry = {
        date: string;
        title: string;
        fullTitle: string;
        category: string;
        slug: string;
      };

      console.log("days ne: ", days);
      const posts: PostEntry[] = days
        .filter((day) => day.project === repo)
        .map((day) => {
          const date = "22-02-2024";
          const fullTitle = day.title;
          const category = "category";
          let titleParts = fullTitle;
          let title = titleParts;
          return {
            date,
            title,
            fullTitle,
            category,
            slug: day.slug,
          };
        });

      markdown = `\n\n${posts
        .slice(0, 7)
        .map(
          (post) =>
            `<span class="block md:inline-block mt-3 md:mt-0 post-date">${post.date}</span> [${post.fullTitle}](/${repo}/${post.slug})`
        )
        .join("\n")}`;
    } else {
      markdown = days
        .filter((day) => day.project === repo)
        .map((day) => {
          let content = day.rawTokens.filter(
            (t) =>
              t.type === "text" ||
              t.type === "paragraph" ||
              t.type === "link" ||
              t.type === "strong" ||
              t.type === "em" ||
              t.type === "space"
          );
          return {
            title: day.title,
            slug: day.slug,
            content:
              content
                .slice(0, 4)
                .map((t) => t.raw)
                .join("")
                .trimEnd()
                .replace(/:$/, "") + (content.length > 4 ? "..." : ""),
          };
        })
        .map(
          (post) =>
            `# ${post.title}\n\n${post.content}\n\n[Read more ->](/${repo}/${post.slug})`
        )
        .join("\n\n\n");
    }
  }

  const isDevEnv = process.env.NODE_ENV === "development";
  if (markdown && repo) {
    return {
      revalidate: reload || isDevEnv ? 1 : 60 * 60,
      props: { markdown, postTitle, repo, subpath },
    };
  } else {
    return {
      notFound: true,
    };
  }
};

const Devlog: NextPage = ({
  markdown,
  postTitle,
  repo,
  subpath,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  // hljs.addPlugin(
  //   new LineFocusPlugin({
  //     unfocusedStyle: {
  //       opacity: "0.35",
  //       filter: "grayscale(1)",
  //     },
  //   })
  // );

  marked.setOptions({
    gfm: true,
    breaks: true,
    smartypants: true,
    highlight: function (code, lang) {
      const language = lang || "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  });

  let content = marked.parse(markdown);

  const pageTitle = postTitle ? `${postTitle}` : "abc.test/" + repo;
  const description =
    markdown
      .split("\n")
      .filter(
        (line: string) =>
          !line.startsWith("# ") &&
          !line.startsWith("\n") &&
          line.length >= 5 &&
          line.indexOf("arrow pull-back") === -1
      )
      .slice(0, 3)
      .join(" ")
      .substr(0, 157) + "...";

  const socialImage = postTitle
    ? `https://abc.test/api/image?t=${base64_encode(postTitle)}`
    : "https://abc.test/social-image.png";
  const isEntryContent = subpath.length;

  return (
    <>
      <CommonSEO
        title={pageTitle}
        description={description}
        ogType={"article"}
        ogImage={socialImage}
      />
      <main className="container-center my-10">
        {!subpath && (
          <div className="relative">
            <input
              className="w-full h-12 rounded-xl search-color placeholder:font-medium placeholder:text-white pl-5 text-white font-medium text-xl font-mono"
              placeholder="Search something..."
            />
            <span className="material-symbols-outlined absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2 text-white animate-pulse text-3xl">
              search
            </span>
          </div>
        )}
        <div
          className={`github-theme my-10 ${
            isEntryContent ? "post-content" : ""
          }`}
          dangerouslySetInnerHTML={{ __html: content }}
        ></div>
      </main>
      {/* <script dangerouslySetInnerHTML={{ __html: loadScript }}></script> */}
    </>
  );
};

export default Devlog;
