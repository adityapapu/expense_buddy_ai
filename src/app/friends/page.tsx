import FriendsList from "../../components/FriendsList";

export default async function Page() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Friends</h1>
      <FriendsList />
    </div>
  );
}