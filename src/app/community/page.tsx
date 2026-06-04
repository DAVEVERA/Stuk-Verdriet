import { createCommunityPost } from "@/lib/actions";
import { CommunityCategoryGrid, CommunityPostCard, PageIntro } from "@/components/ui";
import { getApprovedCommunityPosts, getCommunityCategories } from "@/lib/content";

export default async function CommunityPage() {
  const [categories, posts] = await Promise.all([getCommunityCategories(), getApprovedCommunityPosts()]);
  return (
    <>
      <PageIntro eyebrow="Community" title="Een rustige plek voor herkenning en steun">
        <p>Berichten en reacties worden eerst gelezen door een beheerder. Bij acute nood is deze website geen vervanging voor professionele hulp.</p>
      </PageIntro>
      <section className="content-band">
        <CommunityCategoryGrid categories={categories} />
      </section>
      <section className="content-band">
        <div className="section-heading">
          <p className="eyebrow">Berichten</p>
          <h2>Goedgekeurde gesprekken</h2>
        </div>
        <div className="post-grid">
          {posts.map((post) => (
            <CommunityPostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
      <section className="content-band">
        <div className="section-heading">
          <p className="eyebrow">Deel je ervaring</p>
          <h2>Nieuw bericht</h2>
          <p>Inloggen is nodig om te plaatsen. Je bericht staat eerst op pending.</p>
        </div>
        <form className="form-grid" action={createCommunityPost}>
          <label>
            Titel
            <input name="title" required />
          </label>
          <label>
            Categorie
            <select name="category" required>
              {categories.map((category) => (
                <option key={category.id}>{category.title}</option>
              ))}
            </select>
          </label>
          <label>
            Zichtbare naam
            <select name="author_display_type" defaultValue="first_name">
              <option value="first_name">Voornaam</option>
              <option value="real_name">Volledige naam</option>
              <option value="anonymous">Anoniem</option>
            </select>
          </label>
          <label>
            Doelgroep of thema
            <input name="target_group" />
          </label>
          <label>
            Bericht
            <textarea name="body" required />
          </label>
          <button className="button" type="submit">
            Deel je ervaring
          </button>
        </form>
      </section>
    </>
  );
}
