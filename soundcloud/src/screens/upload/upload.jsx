import React, { useEffect, useRef, useState } from "react";
import "./upload.css";
import logo from "../../assets/img/logo.png";

const Upload = () => {
	const [modalOpen, setModalOpen] = useState(false);
	const [step, setStep] = useState("select");
	const [selectedFile, setSelectedFile] = useState(null);
	const [audioUrl, setAudioUrl] = useState("");
	const [title, setTitle] = useState("");
	const [coverUrl, setCoverUrl] = useState("");
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
		if (coverFileUrlRef.current) {
			URL.revokeObjectURL(coverFileUrlRef.current);
			coverFileUrlRef.current = "";
		}
	};

	const closeModal = () => {
		setModalOpen(false);
		if (audioUrl) URL.revokeObjectURL(audioUrl);
		setAudioUrl("");
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

	const handleSave = () => {
		// Placeholder for upload logic
		closeModal();
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
							<div className="modal-body">
								<div className="field">
									<label>Title</label>
									<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Track title" />
								</div>
								<div className="field">
									<label>Cover image</label>
									<div className="field-inline">
										<input
											value={coverUrl}
											onChange={(e) => setCoverUrl(e.target.value)}
											placeholder="https://... or leave empty"
										/>
										<button type="button" className="secondary-btn" onClick={triggerCoverSelect}>
											Upload file
										</button>
										<input
											type="file"
											accept="image/*"
											ref={coverInputRef}
											onChange={onCoverFileChange}
											style={{ display: "none" }}
										/>
									</div>
								</div>
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
										<audio ref={audioRef} src={audioUrl} controls className="audio-player" preload="metadata" />
										<button type="button" className="primary-btn" onClick={handlePlayPause}>
											Play / Pause
										</button>
									</div>
								</div>
								<div className="modal-actions">
									<button className="secondary-btn" type="button" onClick={closeModal}>Cancel</button>
									<button className="primary-btn" type="button" onClick={handleSave}>Save & Upload</button>
								</div>
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
