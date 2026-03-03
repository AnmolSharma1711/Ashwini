import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPatientReports, getReportAnalysis, uploadReport } from "../api";

const ReportAnalysis = ({ patientId }) => {
	const [reports, setReports] = useState([]);
	const [selectedReport, setSelectedReport] = useState(null);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });
	const [uploadingReport, setUploadingReport] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);

	const showMessage = (type, text) => {
		setMessage({ type, text });
		setTimeout(() => setMessage({ type: "", text: "" }), 5000);
	};

	useEffect(() => {
		if (patientId) {
			fetchReports();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [patientId]);

	const fetchReports = async () => {
		setLoading(true);
		try {
			const response = await getPatientReports(patientId);
			setReports(response.data);
			
			// Auto-select the latest report if available
			if (response.data.length > 0) {
				handleReportSelect(response.data[0].id);
			}
		} catch (error) {
			showMessage("error", "Failed to fetch reports");
		} finally {
			setLoading(false);
		}
	};

	const handleReportSelect = async (reportId) => {
		setLoading(true);
		try {
			const response = await getReportAnalysis(reportId);
			setSelectedReport(response.data);
		} catch (error) {
			showMessage("error", "Failed to load report analysis");
		} finally {
			setLoading(false);
		}
	};

	const handleFileSelect = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Validate file type
			const allowedTypes = [
				"image/jpeg",
				"image/jpg",
				"image/png",
				"application/pdf",
			];
			if (!allowedTypes.includes(file.type)) {
				showMessage(
					"error",
					"Please select a valid image file (JPG, PNG) or PDF",
				);
				return;
			}

			// Validate file size (max 10MB)
			if (file.size > 10 * 1024 * 1024) {
				showMessage("error", "File size must be less than 10MB");
				return;
			}

			setSelectedFile(file);
		}
	};

	const handleUploadReport = async () => {
		if (!patientId) {
			showMessage("error", "Please select a patient first");
			return;
		}

		if (!selectedFile) {
			showMessage("error", "Please select a file to upload");
			return;
		}

		setUploadingReport(true);
		try {
			const formData = new FormData();
			formData.append("report_image", selectedFile);
			formData.append("uploaded_by", "report_analysis_page");

			await uploadReport(patientId, formData);

			showMessage(
				"success",
				"Report uploaded successfully! Analysis in progress...",
			);

			// Reset file selection
			setSelectedFile(null);
			const fileInput = document.getElementById("reportFileInput");
			const cameraInput = document.getElementById("reportCameraInput");
			if (fileInput) fileInput.value = "";
			if (cameraInput) cameraInput.value = "";

			// Refresh reports list
			setTimeout(() => {
				fetchReports();
			}, 2000);
		} catch (error) {
			showMessage(
				"error",
				"Failed to upload report: " +
					(error.response?.data?.detail || error.message),
			);
		} finally {
			setUploadingReport(false);
		}
	};

	const getStatusBadgeClass = (status) => {
		switch (status) {
			case "completed":
				return "bg-success";
			case "processing":
				return "bg-info";
			case "failed":
				return "bg-danger";
			default:
				return "bg-warning";
		}
	};

	return (
		<div className="report-analysis">
			<div className="card">
				<div className="card-header bg-primary text-white">
					<h5 className="mb-0">
						<i className="bi bi-file-medical"></i> Medical Report
						Analysis
					</h5>
				</div>
				<div className="card-body">
					{/* Alert Message */}
					{message.text && (
						<div
							className={`alert alert-${
								message.type === "success" ? "success" : "danger"
							} alert-dismissible fade show`}
							role="alert"
						>
							{message.text}
							<button
								type="button"
								className="btn-close"
								onClick={() =>
									setMessage({ type: "", text: "" })
								}
							></button>
						</div>
					)}

					{/* Upload Medical Report Section */}
					<div className="card mb-4 border-warning">
						<div className="card-header bg-warning">
							<h5 className="mb-0">
								<i className="bi bi-cloud-upload"></i> Upload Medical Report
							</h5>
						</div>
						<div className="card-body">
							<p className="mb-3">
								Upload lab reports, prescriptions, or medical documents for AI-powered analysis.
							</p>

							{/* File Upload or Camera Options */}
							<div className="mb-3">
								<div className="btn-group w-100 mb-2" role="group">
									<input
										type="file"
										id="reportFileInput"
										className="d-none"
										accept="image/jpeg,image/jpg,image/png,application/pdf"
										onChange={handleFileSelect}
										disabled={!patientId || uploadingReport}
									/>
									<label
										htmlFor="reportFileInput"
										className="btn btn-outline-primary w-50"
										style={{
											cursor: patientId && !uploadingReport ? "pointer" : "not-allowed",
										}}
									>
										<i className="bi bi-folder2-open"></i> Choose File
									</label>

									<input
										type="file"
										id="reportCameraInput"
										className="d-none"
										accept="image/*"
										capture="environment"
										onChange={handleFileSelect}
										disabled={!patientId || uploadingReport}
									/>
									<label
										htmlFor="reportCameraInput"
										className="btn btn-outline-primary w-50"
										style={{
											cursor: patientId && !uploadingReport ? "pointer" : "not-allowed",
										}}
									>
										<i className="bi bi-camera"></i> Take Photo
									</label>
								</div>

								{selectedFile && (
									<div className="alert alert-success py-2 mb-0">
										<i className="bi bi-check-circle"></i>{" "}
										<strong>Selected:</strong> {selectedFile.name}
										<br />
										<small>
											Size: {(selectedFile.size / 1024).toFixed(2)} KB
										</small>
									</div>
								)}
							</div>

							<button
								className="btn btn-warning w-100 mb-2"
								onClick={handleUploadReport}
								disabled={!patientId || !selectedFile || uploadingReport}
							>
								<i className="bi bi-cloud-upload"></i>{" "}
								{uploadingReport ? "Uploading & Analyzing..." : "Upload & Analyze Report"}
							</button>

							<p className="text-muted mb-0 small">
								<i className="bi bi-info-circle"></i> Supported formats: JPG, PNG, PDF (Max 10MB)
								<br />
								<strong>Azure AI Document Intelligence</strong> will extract text and key medical phrases
							</p>
						</div>
					</div>

					{loading && (
						<div className="text-center py-4">
							<div
								className="spinner-border text-primary"
								role="status"
							>
								<span className="visually-hidden">
									Loading...
								</span>
							</div>
						</div>
					)}

					{!loading && reports.length === 0 && (
						<div className="text-center text-muted py-4">
							<i
								className="bi bi-inbox"
								style={{ fontSize: "3rem" }}
							></i>
							<p className="mt-2">No reports uploaded yet</p>
							<small>
								Use the upload section above to add a medical report
							</small>
						</div>
					)}

					{!loading && reports.length > 0 && (
						<div className="row">
							{/* Report Selection Sidebar */}
							<div className="col-md-4">
								<h6 className="mb-3">Available Reports</h6>
								<div className="list-group">
									{reports.map((report) => (
										<button
											key={report.id}
											className={`list-group-item list-group-item-action ${
												selectedReport?.id ===
												report.id
													? "active"
													: ""
											}`}
											onClick={() =>
												handleReportSelect(report.id)
											}
										>
											<div className="d-flex w-100 justify-content-between">
												<h6 className="mb-1">
													Report #{report.id}
												</h6>
												<span
													className={`badge ${getStatusBadgeClass(
														report.analysis_status
													)}`}
												>
													{report.analysis_status}
												</span>
											</div>
											<small>
												{new Date(
													report.uploaded_at
												).toLocaleString()}
											</small>
										</button>
									))}
								</div>
							</div>

							{/* Report Analysis Details */}
							<div className="col-md-8">
								{selectedReport ? (
									<div>
										<h6 className="mb-3">
											Analysis Results
										</h6>

										{/* Analysis Status */}
										<div className="mb-3">
											<strong>Status: </strong>
											<span
												className={`badge ${getStatusBadgeClass(
													selectedReport.analysis_status
												)}`}
											>
												{selectedReport.analysis_status}
											</span>
											{selectedReport.confidence_score && (
												<span className="ms-2">
													<strong>
														Confidence:{" "}
													</strong>
													{(
														selectedReport.confidence_score *
														100
													).toFixed(1)}
													%
												</span>
											)}
										</div>

										{/* Key Phrases */}
										{selectedReport.key_phrases_list &&
											selectedReport.key_phrases_list
												.length > 0 && (
												<div className="mb-4">
													<h6 className="text-primary">
														<i className="bi bi-key"></i>{" "}
														Key Medical Phrases
													</h6>
													<div className="card bg-light">
														<div className="card-body">
															<ul className="mb-0">
																{selectedReport.key_phrases_list.map(
																	(
																		phrase,
																		index
																	) => (
																		<li
																			key={
																				index
																			}
																			className="mb-2"
																		>
																			<span className="badge bg-info text-dark me-2">
																				{index +
																					1}
																			</span>
																			{
																				phrase
																			}
																		</li>
																	)
																)}
															</ul>
														</div>
													</div>
												</div>
											)}

										{/* Extracted Text */}
										{selectedReport.extracted_text && (
											<div className="mb-4">
												<h6 className="text-primary">
													<i className="bi bi-file-medical"></i>{" "}
													Medical Report Summary
												</h6>
												<div
													className="card"
													style={{
														maxHeight: "500px",
														overflowY: "auto",
													}}
												>
													<div className="card-body">
														<ReactMarkdown
															remarkPlugins={[remarkGfm]}
															className="markdown-content"
															components={{
																h1: ({children}) => <h4 className="text-primary mt-3 mb-2">{children}</h4>,
																h2: ({children}) => <h5 className="text-secondary mt-3 mb-2">{children}</h5>,
																h3: ({children}) => <h6 className="text-dark mt-2 mb-1">{children}</h6>,
																p: ({children}) => <p className="mb-2">{children}</p>,
																ul: ({children}) => <ul className="mb-2">{children}</ul>,
																li: ({children}) => <li className="mb-1">{children}</li>,
																strong: ({children}) => <strong className="text-dark">{children}</strong>,
																hr: () => <hr className="my-3" />,
																table: ({children}) => <table className="table table-sm table-bordered">{children}</table>
															}}
														>
															{
																selectedReport.extracted_text
															}
														</ReactMarkdown>
													</div>
												</div>
											</div>
										)}

										{/* Doctor Notes */}
										{selectedReport.doctor_notes && (
											<div className="mb-4">
												<h6 className="text-primary">
													<i className="bi bi-clipboard-check"></i>{" "}
													Doctor's Notes
												</h6>
												<div className="alert alert-info">
													{selectedReport.doctor_notes}
												</div>
											</div>
										)}

										{/* Status Messages */}
										{selectedReport.analysis_status ===
											"pending" && (
											<div className="alert alert-warning">
												<i className="bi bi-clock"></i>{" "}
												Analysis is pending...
											</div>
										)}

										{selectedReport.analysis_status ===
											"processing" && (
											<div className="alert alert-info">
												<i className="bi bi-gear"></i>{" "}
												Analysis in progress...
											</div>
										)}

										{selectedReport.analysis_status ===
											"failed" && (
											<div className="alert alert-danger">
												<i className="bi bi-exclamation-triangle"></i>{" "}
												Analysis failed. Please try
												uploading again.
											</div>
										)}
									</div>
								) : (
									<div className="text-center text-muted py-4">
										<p>Select a report to view details</p>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ReportAnalysis;
