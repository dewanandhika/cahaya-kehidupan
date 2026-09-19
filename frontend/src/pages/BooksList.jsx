import WorkList from "@/components/WorkList";

export default function BooksList() {
  return (
    <WorkList
      kind="books"
      meta={{ title: "Buku", singular: "Buku", route: "books", sub: "Kelola koleksi buku karya Arief Sulistyanto." }}
    />
  );
}
