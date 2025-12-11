import React, { useEffect, useRef, useState } from "react";
import "./upload.css";
import logo from "../../assets/img/logo.png";
import { uploadTrack } from "../../api/upload";

const Upload = () => {
	const [modalOpen, setModalOpen] = useState(false);
	const [step, setStep] = useState("select");
	const [selectedFile, setSelectedFile] = useState(null);
	const [audioUrl, setAudioUrl] = useState("");
	const [title, setTitle] = useState("");
	const [coverUrl, setCoverUrl] = useState("");
	const [coverFile, setCoverFile] = useState(null);
	const [description, setDescription] = useState("");
	const [isPrivate, setIsPrivate] = useState(false);
	const [durationSeconds, setDurationSeconds] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState("");
	const coverFileUrlRef = useRef("");
	const audioRef = useRef(null);
	const fileInputRef = useRef(null);
	const coverInputRef = useRef(null);

	useEffect(() => {
		return () => {
			if (audioUrl) URL.revokeObjectURL(audioUrl);
			if (coverFileUrlRef.current) URL.revokeObjectURL(coverFileUrlRef.current);
		};
	}, [audioUrl]);

	const openModal = () => {
		setModalOpen(true);
		setStep("select");
		setSelectedFile(null);
		setAudioUrl("");
		setTitle("");
		setCoverUrl("");
		setCoverFile(null);
		setDescription("");
		setIsPrivate(false);
		setDurationSeconds(null);
		setIsUploading(false);
		setError("");
		if (coverFileUrlRef.current) {
			URL.revokeObjectURL(coverFileUrlRef.current);
			coverFileUrlRef.current = "";
		}
	};

	const closeModal = () => {
		setModalOpen(false);
		setStep("select");
		if (audioUrl) URL.revokeObjectURL(audioUrl);
		setAudioUrl("");
		setSelectedFile(null);
		setTitle("");
		setCoverUrl("");
		setCoverFile(null);
		setDescription("");
		setIsPrivate(false);
		setDurationSeconds(null);
		setIsUploading(false);
		setError("");
		if (coverFileUrlRef.current) {
			URL.revokeObjectURL(coverFileUrlRef.current);
			coverFileUrlRef.current = "";
		}
	};

	const handleFilePicked = (file) => {
		if (!file) return;
		const url = URL.createObjectURL(file);
		setSelectedFile(file);
		setAudioUrl(url);
		const baseName = file.name.replace(/\.[^.]+$/, "");
		setTitle(baseName);
		setDurationSeconds(null);
		setStep("details");
	};

	const onFileInputChange = (e) => {
		const file = e.target.files?.[0];
		handleFilePicked(file);
	};

	const onCoverFileChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (coverFileUrlRef.current) {
			URL.revokeObjectURL(coverFileUrlRef.current);
		}
		const url = URL.createObjectURL(file);
		coverFileUrlRef.current = url;
		setCoverUrl(url);
		setCoverFile(file);
	};

	const triggerFileSelect = () => {
		fileInputRef.current?.click();
	};

	const triggerCoverSelect = () => {
		coverInputRef.current?.click();
	};

	const handlePlayPause = () => {
		if (!audioRef.current) return;
		if (audioRef.current.paused) {
			audioRef.current.play();
		} else {
			audioRef.current.pause();
		}
	};

	const handleMetadataLoaded = (event) => {
		if (!event?.target) return;
		const rawDuration = Number.isFinite(event.target.duration) ? event.target.duration : 0;
		setDurationSeconds(rawDuration > 0 ? Math.round(rawDuration) : null);
	};

	const handleSave = async () => {
		if (!selectedFile || isUploading) return;
		setIsUploading(true);
		setError("");

		try {
			await uploadTrack({
				file: selectedFile,
				title: title.trim(),
				coverFile,
				coverUrl: coverFile ? "" : coverUrl.trim(),
				description: description.trim(),
				isPrivate,
				durationSeconds: durationSeconds ?? undefined
			});
			closeModal();
		} catch (err) {
			const message = err?.response?.data?.error
				?? err?.response?.data
				?? err?.message
				?? "Не удалось загрузить трек";
			setError(typeof message === "string" ? message : "Не удалось загрузить трек");
			setIsUploading(false);
		}
	};

	return (
		<div className="upload-page">
			<header className="upload-header">
				<div className="upload-brand">
					<img className="upload-logo" src={logo} alt="SoundCloud" />
					<span className="upload-title">Upload</span>
				</div>
			</header>

			<main className="upload-content">
				<section className="panel">
					<div className="panel-title">Upload your audio files.</div>
					<p className="panel-sub">For best quality, use WAV, FLAC, AIFF, or ALAC. The maximum file size is 4GB uncompressed.</p>

					<div className="dropzone" onClick={openModal} role="button" tabIndex={0}>
						<div className="drop-icon" aria-hidden="true">
							<img src={logo} alt="Upload" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
						</div>
						<div className="drop-hint">Drag and drop audio files to get started.</div>
						<button className="primary-btn" type="button">Choose files</button>
					</div>
				</section>
			</main>

			{modalOpen && (
				<div className="upload-modal-backdrop">
					<div className="upload-modal" role="dialog" aria-modal="true">
						<div className="modal-header">
							<div>
								<div className="modal-title">{step === "select" ? "Select an audio file" : "Track details"}</div>
								<div className="modal-sub">Supported: WAV, FLAC, AIFF, ALAC, MP3.</div>
							</div>
							<button className="icon-btn" type="button" onClick={closeModal} aria-label="Close">✕</button>
						</div>

						{step === "select" && (
							<div className="modal-body">
								<div className="modal-drop" onClick={triggerFileSelect} role="button" tabIndex={0}>
									<div className="modal-drop-icon" aria-hidden="true">
										<img src={logo} alt="Upload" />
									</div>
									<div className="modal-drop-text">Click to choose a file</div>
									<div className="modal-drop-sub">or drag and drop it here</div>
								</div>
								<input
									type="file"
									accept="audio/*"
									ref={fileInputRef}
									onChange={onFileInputChange}
									style={{ display: "none" }}
								/>
							</div>
						)}

						{step === "details" && (
							<div className="modal-body details-view">
								<div className="details-grid">
									<div className="field field-span-full">
										<label>Title</label>
										<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Track title" />
									</div>
									<div className="field">
										<label>Cover image</label>
										<div className="field-inline" style={{ gap: 12, alignItems: "center" }}>
											<button type="button" className="secondary-btn" onClick={triggerCoverSelect}>
												Upload file
											</button>
											<span className="field-hint">
												{coverFile ? coverFile.name : "PNG, JPG, WEBP up to 10MB"}
											</span>
											<input
												type="file"
												accept="image/*"
												ref={coverInputRef}
												onChange={onCoverFileChange}
												style={{ display: "none" }}
											/>
										</div>
									</div>
									<div className="field field-span-full">
										<label>Description</label>
										<textarea
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											placeholder="Tell listeners about your track"
											rows={4}
										/>
									</div>
									<div className="field checkbox-field field-span-full">
										<label>
											<input
												type="checkbox"
												checked={isPrivate}
												onChange={(e) => setIsPrivate(e.target.checked)}
											/>
											Make track private
										</label>
									</div>
								</div>
								<div className="section-card preview-section">
									<div className="preview-row">
										<div className="preview-cover">
											{coverUrl ? (
												<img src={coverUrl} alt="Cover" />
											) : (
												<div className="cover-placeholder">No cover</div>
											)}
										</div>
										<div className="preview-audio">
											<div className="file-name">{selectedFile?.name}</div>
											<audio
												ref={audioRef}
												src={audioUrl}
												controls
												className="audio-player"
												preload="metadata"
												onLoadedMetadata={handleMetadataLoaded}
											/>
											{durationSeconds !== null && (
												<div className="audio-duration">Duration: {durationSeconds} sec</div>
											)}
											<button type="button" className="primary-btn" onClick={handlePlayPause}>
												Play / Pause
											</button>
										</div>
									</div>
								</div>
								<div className="modal-actions section-card actions-card">
									<button className="secondary-btn" type="button" onClick={closeModal} disabled={isUploading}>Cancel</button>
									<button
										className="primary-btn"
										type="button"
										onClick={handleSave}
										disabled={!selectedFile || isUploading}
										aria-busy={isUploading}
									>
										{isUploading ? "Uploading..." : "Save & Upload"}
									</button>
								</div>
								{error && <div className="error-text" role="alert">{error}</div>}
							</div>
						)}
					</div>
				</div>
			)}

			<footer className="upload-footer">
				Legal - Privacy - Cookie Policy - Cookie Manager - Imprint - About us - Copyright - Feedback
			</footer>
		</div>
	);
};

export default Upload;
