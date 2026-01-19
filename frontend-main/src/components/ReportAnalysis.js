import React, { useState, useEffect } from "react";
import { getPatientReports, getReportAnalysis } from "../api";

const ReportAnalysis = ({ patientId }) => {
	const [reports, setReports] = useState([]);
	const [selectedReport, setSelectedReport] = useState(null);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

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
								Upload a medical report from the Health
								Monitoring Station
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
													<i className="bi bi-file-text"></i>{" "}
													Extracted Text (OCR)
												</h6>
												<div
													className="card"
													style={{
														maxHeight: "400px",
														overflowY: "auto",
													}}
												>
													<div className="card-body">
														<pre
															style={{
																whiteSpace:
																	"pre-wrap",
																wordWrap:
																	"break-word",
																fontSize:
																	"0.9rem",
															}}
														>
															{
																selectedReport.extracted_text
															}
														</pre>
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
