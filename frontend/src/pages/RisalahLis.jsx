import WorkList from "@/components/WorkList";

export default function RisalahList() {
  return (
    <WorkList
      kind="risalahs"
      meta={{ title: "Risalah", singular: "Risalah", route: "risalah", sub: "Kelola naskah dan risalah pemikiran." }}
    />
  );
}
