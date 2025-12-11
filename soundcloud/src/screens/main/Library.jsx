import React, { useEffect, useState } from "react";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import { fetchProfile } from "../../api/profile";
import UserTracks from "../profile/UserTracks.jsx";
import UserPlaylists from "../profile/UserPlaylists.jsx";
import "./library.css";

const tabs = [
	{ key: "overview", label: "Overview" },
	{ key: "likes", label: "Likes" },
	{ key: "playlists", label: "Playlists" },
	{ key: "following", label: "Following" }
];

const Library = () => {
	const [activeTab, setActiveTab] = useState("overview");
	const [avatarUrl, setAvatarUrl] = useState(null);
	const [libraryData, setLibraryData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadProfile = async () => {
			setLoading(true);
			try {
				const data = await fetchProfile();
				setLibraryData(data ?? null);
				setAvatarUrl(data?.profile?.avatar_url ?? null);
				setError("");
			} catch (err) {
				console.error("Failed to fetch profile", err);
				setError(err?.message ?? "Unable to load your library at the moment.");
			} finally {
				setLoading(false);
			}
		};
		loadProfile();
	}, []);

	const tracks = libraryData?.tracks ?? [];
	const playlists = libraryData?.playlists ?? [];
	const likedPlaylists = libraryData?.liked_playlists ?? [];
	const likedTracks = libraryData?.likes ?? [];
	const following = libraryData?.following ?? [];

	const renderPlaylistsSection = () => (
		<>
			<UserPlaylists
				playlists={playlists}
				loading={loading}
				title="Your playlists"
				isOwnProfile={false}
			/>
			<UserPlaylists
				playlists={likedPlaylists}
				loading={loading}
				title="Liked playlists"
				isOwnProfile={false}
				emptyMessage="You have not liked any playlists yet."
			/>
		</>
	);

	const renderFollowing = () => (
		<FollowingPanel following={following} loading={loading} />
	);

	const renderOverview = () => (
		<>
			<UserTracks tracks={tracks} loading={loading} title="Your tracks" />
			<UserTracks tracks={likedTracks} loading={loading} title="Liked tracks" />
			{renderPlaylistsSection()}
			{renderFollowing()}
		</>
	);

	const renderTabContent = () => {
		switch (activeTab) {
			case "likes":
				return <UserTracks tracks={likedTracks} loading={loading} title="Liked tracks" />;
			case "playlists":
				return renderPlaylistsSection();
			case "following":
				return renderFollowing();
			default:
				return renderOverview();
		}
	};

	return (
		<div className="library-shell">
			<Header avatarUrl={avatarUrl} />
			<main className="library-wrapper">
				<div className="library-content">
					<div className="library-tabs">
						{tabs.map((tab) => (
							<button
								key={tab.key}
								className={`library-tab ${activeTab === tab.key ? "is-active" : ""}`}
								onClick={() => setActiveTab(tab.key)}
							>
								{tab.label}
							</button>
						))}
					</div>
					{error && (
						<div className="library-error">
							{error}
						</div>
					)}
					<div className="library-stack">
						{renderTabContent()}
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
};

const FollowingPanel = ({ following = [], loading }) => {
	if (loading) {
		return (
			<section className="following-panel">
				<div className="following-panel__header">
					<h2>Following</h2>
					<span>—</span>
				</div>
				<p className="following-panel__empty">Loading...</p>
			</section>
		);
	}

	if (!following.length) {
		return (
			<section className="following-panel">
				<div className="following-panel__header">
					<h2>Following</h2>
					<span>0 accounts</span>
				</div>
				<p className="following-panel__empty">You are not following anyone yet.</p>
			</section>
		);
	}

	return (
		<section className="following-panel">
			<div className="following-panel__header">
				<h2>Following</h2>
				<span>{following.length} accounts</span>
			</div>
			<div className="following-panel__list">
				{following.map((person) => (
					<div key={person.id ?? person.username} className="following-card">
						<div
							className="following-card__avatar"
							style={{ backgroundImage: `url(${person.avatarUrl ?? "https://i.imgur.com/6unG5jv.png"})` }}
						/>
						<div className="following-card__body">
							<strong>{person.username ?? "Unknown"}</strong>
							<span>
								{person.followers ?? 0} followers · {person.tracks ?? 0} tracks
							</span>
						</div>
						<button type="button">Following</button>
					</div>
				))}
			</div>
		</section>
	);
};

export default Library;
