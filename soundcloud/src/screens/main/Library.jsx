import React, { useEffect, useState } from "react";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import { fetchProfile } from "../../api/profile";
import UserTracks from "../profile/UserTracks.jsx";
import UserPlaylists from "../profile/UserPlaylists.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import "./library.css";
import { fetchHomeSidebar } from "../../api/home";

const tabs = [
	{ key: "overview", label: "Overview" },
	{ key: "likes", label: "Likes" },
	{ key: "history", label: "History" },
	{ key: "playlists", label: "Playlists" },
	{ key: "following", label: "Following" }
];

const FALLBACK_HISTORY_COVER = "https://i.imgur.com/6unG5jv.png";

const normalizeHistoryTrack = (track = {}) => {
	if (!track || typeof track !== "object") {
		return {
			trackId: null,
			title: "",
			plays: 0,
			likes: 0,
			artist: "",
			artistId: null,
			artistAvatar: FALLBACK_HISTORY_COVER,
			coverUrl: FALLBACK_HISTORY_COVER,
			durationSeconds: null
		};
	}

	const trackId = track.trackId ?? track.track_id ?? track.id ?? null;

	return {
		trackId,
		title: track.title ?? track.Title ?? "Untitled track",
		plays: Number.isFinite(track.plays) ? track.plays : Number(track.plays) || 0,
		likes: Number.isFinite(track.likes) ? track.likes : Number(track.likes) || 0,
		artist: track.artist ?? track.Artist ?? "Unknown artist",
		artistId: track.artistId ?? track.artist_id ?? null,
		artistAvatar: track.artistAvatar ?? track.artist_avatar ?? FALLBACK_HISTORY_COVER,
		coverUrl: track.coverUrl ?? track.cover_url ?? track.artistAvatar ?? track.artist_avatar ?? FALLBACK_HISTORY_COVER,
		durationSeconds: track.durationSeconds ?? track.duration_seconds ?? null
	};
};

const Library = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState(() => {
		const searchParams = new URLSearchParams(location.search);
		const candidate = (searchParams.get("tab") ?? "overview").toLowerCase();
		return tabs.some((tab) => tab.key === candidate) ? candidate : "overview";
	});
	const [libraryData, setLibraryData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [historyTracks, setHistoryTracks] = useState([]);
	const [historyLoading, setHistoryLoading] = useState(true);

	useEffect(() => {
		const loadProfile = async () => {
			setLoading(true);
			try {
				const data = await fetchProfile();
				setLibraryData(data ?? null);
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

	useEffect(() => {
		let cancelled = false;

		const loadHistory = async () => {
			setHistoryLoading(true);
			try {
				const data = await fetchHomeSidebar();
				if (!cancelled) {
					const normalized = Array.isArray(data?.history)
						? data.history.map(normalizeHistoryTrack).filter((track) => track.trackId)
						: [];
					setHistoryTracks(normalized);
				}
			} catch (err) {
				console.error("Failed to load listening history", err);
				if (!cancelled) {
					setHistoryTracks([]);
				}
			} finally {
				if (!cancelled) {
					setHistoryLoading(false);
				}
			}
		};

		loadHistory();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const candidate = (searchParams.get("tab") ?? "overview").toLowerCase();
		if (tabs.some((tab) => tab.key === candidate)) {
			setActiveTab(candidate);
		} else {
			setActiveTab("overview");
		}
	}, [location.search]);

	const tracks = libraryData?.tracks ?? [];
	const playlists = libraryData?.playlists ?? [];
	const likedTracks = libraryData?.likes ?? [];
	const following = libraryData?.following ?? [];

	const handleTabSelect = (key) => {
		if (key === activeTab) {
			return;
		}
		setActiveTab(key);
		const search = key === "overview" ? "" : `?tab=${key}`;
		navigate({ pathname: location.pathname, search }, { replace: false });
	};

	const handleOpenPlaylist = (playlistId) => {
		if (!playlistId) {
			return;
		}
		navigate(`/playlists/${playlistId}`);
	};

	const handleOpenProfile = (username) => {
		if (!username) {
			return;
		}
		navigate(`/profile/${username}`);
	};

	const renderFollowing = () => (
		<FollowingPanel
			following={following}
			loading={loading}
			onOpenProfile={handleOpenProfile}
		/>
	);

	const renderOverview = () => (
		<>
			<UserTracks tracks={tracks} loading={loading} title="Your tracks" />
			<UserTracks tracks={likedTracks} loading={loading} title="Liked tracks" />
			<UserPlaylists
				playlists={playlists}
				loading={loading}
				title="Your playlists"
				isOwnProfile={false}
				onPlaylistClick={handleOpenPlaylist}
			/>
			{renderFollowing()}
		</>
	);

	const renderTabContent = () => {
		switch (activeTab) {
			case "likes":
				return <UserTracks tracks={likedTracks} loading={loading} title="Liked tracks" />;
			case "history":
				return (
					<UserTracks
						tracks={historyTracks}
						loading={historyLoading}
						title="Listening history"
						emptyMessage="You haven't listened to anything yet."
					/>
				);
			case "playlists":
				return (
					<UserPlaylists
						playlists={playlists}
						loading={loading}
						title="Your playlists"
						isOwnProfile={false}
						onPlaylistClick={handleOpenPlaylist}
					/>
				);
			case "following":
				return renderFollowing();
			default:
				return renderOverview();
		}
	};

	return (
		<div className="library-shell">
			<Header />
			<main className="library-wrapper">
				<div className="library-content">
					<div className="library-tabs">
						{tabs.map((tab) => (
							<button
								key={tab.key}
								className={`library-tab ${activeTab === tab.key ? "is-active" : ""}`}
								onClick={() => handleTabSelect(tab.key)}
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

const FollowingPanel = ({ following = [], loading, onOpenProfile }) => {
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
					<div
						key={person.id ?? person.username}
						className="following-card"
						onClick={() => onOpenProfile?.(person.username)}
						onKeyDown={(event) => {
							if (!onOpenProfile) {
								return;
							}
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								onOpenProfile(person.username);
							}
						}}
						tabIndex={onOpenProfile ? 0 : -1}
						role={onOpenProfile ? "button" : undefined}
					>
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
