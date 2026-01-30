import React, { useState, useEffect, useCallback } from "react";
import {
	getPatients,
	getPatient,
	updatePatient,
	createMeasurement,
	getLatestMeasurement,
	createMeasurementSession,
	uploadReport,
} from "../api";
import ReportAnalysis from "./ReportAnalysis";

const HealthMonitoringStation = () => {
	const [patients, setPatients] = useState([]);
	const [selectedPatient, setSelectedPatient] = useState(null);
	const [latestMeasurement, setLatestMeasurement] = useState(null);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });
	const [deviceMeasuring, setDeviceMeasuring] = useState(false);
	// eslint-disable-next-line no-unused-vars
	const [sessionId, setSessionId] = useState(null);
	const [uploadingReport, setUploadingReport] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [showReportAnalysis, setShowReportAnalysis] = useState(false);

	// Measurement form state
	const [measurementData, setMeasurementData] = useState({
		blood_pressure: "",
		temperature: "",
		spo2: "",
		heart_rate: "",
	});

	const showMessage = (type, text) => {
		setMessage({ type, text });
		setTimeout(() => setMessage({ type: "", text: "" }), 5000);
	};

	const loadPatientDetails = async (patientId) => {
		setLoading(true);
		try {
			const response = await getPatient(patientId);
			setSelectedPatient(response.data);
		} catch (error) {
			showMessage("error", "Failed to load patient details");
		} finally {
			setLoading(false);
		}
	};

	const fetchPatientsForMonitoring = useCallback(async () => {
		try {
			// Fetch patients in waiting or checking status
			const response = await getPatients();
			const monitoringPatients = response.data.filter((p) =>
				["waiting", "checking", "examined"].includes(p.status),
			);
			setPatients(monitoringPatients);

			// Auto-select first checking patient, or first waiting if none checking
			const checkingPatient = monitoringPatients.find(
				(p) => p.status === "checking",
			);
			if (checkingPatient) {
				loadPatientDetails(checkingPatient.id);
			} else if (monitoringPatients.length > 0) {
				loadPatientDetails(monitoringPatients[0].id);
			}
		} catch (error) {
			showMessage("error", "Failed to fetch patients");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		fetchPatientsForMonitoring();
	}, [fetchPatientsForMonitoring]);

	useEffect(() => {
		if (selectedPatient) {
			fetchLatestMeasurement(selectedPatient.id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedPatient]);

	const fetchLatestMeasurement = async (patientId) => {
		try {
			const response = await getLatestMeasurement(patientId);
			setLatestMeasurement(response.data);
		} catch (error) {
			setLatestMeasurement(null);
		}
	};

	const handlePatientSelect = (e) => {
		const patientId = parseInt(e.target.value);
		loadPatientDetails(patientId);
	};

	const handleMeasurementChange = (e) => {
		const { name, value } = e.target;
		setMeasurementData({ ...measurementData, [name]: value });
	};

	const handleSaveMeasurement = async (e) => {
		e.preventDefault();
		if (!selectedPatient) {
			showMessage("error", "Please select a patient first");
			return;
		}

		setLoading(true);
		try {
			// Merge manual entry with existing latestMeasurement data
			// Only update fields that have actual values entered (not blank)
			const dataToSend = {};

			// Start with existing measurement data if available (from device)
			if (latestMeasurement && latestMeasurement.source === "device") {
				if (latestMeasurement.blood_pressure) {
					dataToSend.blood_pressure =
						latestMeasurement.blood_pressure;
				}
				if (latestMeasurement.temperature) {
					dataToSend.temperature = latestMeasurement.temperature;
				}
				if (latestMeasurement.spo2) {
					dataToSend.spo2 = latestMeasurement.spo2;
				}
				if (latestMeasurement.heart_rate) {
					dataToSend.heart_rate = latestMeasurement.heart_rate;
				}
			}

			// Override with manually entered values (only if not empty)
			Object.keys(measurementData).forEach((key) => {
				if (
					measurementData[key] !== "" &&
					measurementData[key] !== null
				) {
					dataToSend[key] = measurementData[key];
				}
			});

			if (Object.keys(dataToSend).length === 0) {
				showMessage("error", "Please enter at least one vital sign");
				setLoading(false);
				return;
			}

			// Source is always "manual" when saved from manual entry form
			dataToSend.source = "manual";

			await createMeasurement(selectedPatient.id, dataToSend);

			showMessage("success", "Measurement saved successfully!");

			// Reset form
			setMeasurementData({
				blood_pressure: "",
				temperature: "",
				spo2: "",
				heart_rate: "",
			});

			// Refresh data
			fetchLatestMeasurement(selectedPatient.id);
			loadPatientDetails(selectedPatient.id);
			fetchPatientsForMonitoring();
		} catch (error) {
			showMessage(
				"error",
				"Failed to save measurement: " +
					(error.response?.data?.detail || error.message),
			);
		} finally {
			setLoading(false);
		}
	};

	const handleStartChecking = async () => {
		if (!selectedPatient) return;

		try {
			await updatePatient(selectedPatient.id, { status: "checking" });
			loadPatientDetails(selectedPatient.id);
			fetchPatientsForMonitoring();
			showMessage("success", "Patient status updated to checking");
		} catch (error) {
			showMessage("error", "Failed to update patient status");
		}
	};

	const handleCompleteExamine = async () => {
		if (!selectedPatient) return;

		try {
			await updatePatient(selectedPatient.id, { status: "examined" });
			loadPatientDetails(selectedPatient.id);
			fetchPatientsForMonitoring();
			showMessage(
				"success",
				"Examination completed! Patient status updated to examined.",
			);
		} catch (error) {
			showMessage("error", "Failed to complete examination");
		}
	};

	const handleStartDeviceMeasurement = async () => {
		if (!selectedPatient) {
			showMessage("error", "Please select a patient first");
			return;
		}

		setDeviceMeasuring(true);
		try {
			// Record the session start time BEFORE creating session
			// This ensures we only accept measurements taken AFTER this time
			const sessionStartTime = new Date();

			// Create a measurement session (device_id = 1 for ESP32)
			const sessionResponse = await createMeasurementSession(
				selectedPatient.id,
				1,
			);
			setSessionId(sessionResponse.data.id);

			showMessage(
				"success",
				"IoT measurement started! Waiting for device to capture readings...",
			);

			// Poll for measurement completion every 2 seconds
			// Only accept measurements that were taken AFTER session started
			const pollInterval = setInterval(async () => {
				try {
					const latestResp = await getLatestMeasurement(
						selectedPatient.id,
					);
					if (
						latestResp.data &&
						latestResp.data.source === "device"
					) {
						// Check if this measurement was taken AFTER session started
						const measurementTime = new Date(
							latestResp.data.timestamp,
						);
						if (measurementTime > sessionStartTime) {
							clearInterval(pollInterval);
							setDeviceMeasuring(false);
							setSessionId(null);
							fetchLatestMeasurement(selectedPatient.id);
							loadPatientDetails(selectedPatient.id);
							showMessage(
								"success",
								"Device measurement completed!",
							);
						}
					}
				} catch (err) {
					// Continue polling
				}
			}, 2000);

			// Timeout after 60 seconds
			setTimeout(() => {
				clearInterval(pollInterval);
				if (deviceMeasuring) {
					setDeviceMeasuring(false);
					setSessionId(null);
					showMessage(
						"warning",
						"Device measurement timeout. Please check device connection.",
					);
				}
			}, 60000);
		} catch (error) {
			setDeviceMeasuring(false);
			showMessage(
				"error",
				"Failed to start device measurement: " +
					(error.response?.data?.error || error.message),
			);
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
		if (!selectedPatient) {
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
			formData.append("uploaded_by", "health_monitoring_station");

			await uploadReport(selectedPatient.id, formData);

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

			// Show report analysis section
			setShowReportAnalysis(true);
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

	return (
		<div className="health-monitoring-station">
			<h2 className="mb-4">Health Monitoring Station</h2>

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
						onClick={() => setMessage({ type: "", text: "" })}
					></button>
				</div>
			)}

			{/* Report Analysis Section */}
			{showReportAnalysis && selectedPatient && (
				<div className="mb-4">
					<ReportAnalysis patientId={selectedPatient.id} />
				</div>
			)}

			<div className="row">
				{/* Patient Selection & Info */}
				<div className="col-md-6">
					<div className="card mb-3">
						<div className="card-header bg-info text-white">
							<h5 className="mb-0">Patient Selection</h5>
						</div>
						<div className="card-body">
							<div className="mb-3">
								<label className="form-label">
									Select Patient:
								</label>
								<select
									className="form-select"
									onChange={handlePatientSelect}
									value={selectedPatient?.id || ""}
								>
									<option value="">
										-- Select a patient --
									</option>
									{patients.map((patient) => (
										<option
											key={patient.id}
											value={patient.id}
										>
											#{patient.id} - {patient.name} (
											{patient.age}, {patient.gender}) -{" "}
											{patient.status}
										</option>
									))}
								</select>
							</div>

							{selectedPatient && (
								<div>
									<hr />
									<h6>Patient Information</h6>
									<table className="table table-sm">
										<tbody>
											<tr>
												<th>Name:</th>
												<td>{selectedPatient.name}</td>
											</tr>
											<tr>
												<th>Age:</th>
												<td>{selectedPatient.age}</td>
											</tr>
											<tr>
												<th>Gender:</th>
												<td>
													{selectedPatient.gender}
												</td>
											</tr>
											<tr>
												<th>Phone:</th>
												<td>
													{selectedPatient.phone ||
														"N/A"}
												</td>
											</tr>
											<tr>
												<th>Status:</th>
												<td>
													<span
														className={`badge ${
															selectedPatient.status ===
															"waiting"
																? "bg-warning"
																: selectedPatient.status ===
																	  "checking"
																	? "bg-info"
																	: "bg-primary"
														}`}
													>
														{selectedPatient.status}
													</span>
												</td>
											</tr>
											<tr>
												<th>Reason:</th>
												<td>
													{selectedPatient.reason ||
														"N/A"}
												</td>
											</tr>
										</tbody>
									</table>

									{selectedPatient.status === "waiting" && (
										<button
											className="btn btn-info w-100"
											onClick={handleStartChecking}
										>
											Start Health Check
										</button>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Latest Measurement Display */}
					<div className="card">
						<div className="card-header bg-secondary text-white">
							<h5 className="mb-0">Latest Measurement</h5>
						</div>
						<div className="card-body">
							{latestMeasurement ? (
								<div>
									<table className="table table-sm">
										<tbody>
											<tr>
												<th>Blood Pressure:</th>
												<td>
													{latestMeasurement.blood_pressure ||
														"N/A"}
												</td>
											</tr>
											<tr>
												<th>Temperature (°C):</th>
												<td>
													{latestMeasurement.temperature ||
														"N/A"}
												</td>
											</tr>
											<tr>
												<th>SpO₂ (%):</th>
												<td>
													{latestMeasurement.spo2 ||
														"N/A"}
												</td>
											</tr>
											<tr>
												<th>Heart Rate (bpm):</th>
												<td>
													{latestMeasurement.heart_rate ||
														"N/A"}
												</td>
											</tr>
											<tr>
												<th>Source:</th>
												<td>
													<span
														className={`badge ${
															latestMeasurement.source ===
															"device"
																? "bg-success"
																: "bg-secondary"
														}`}
													>
														{
															latestMeasurement.source
														}
													</span>
												</td>
											</tr>
											<tr>
												<th>Timestamp:</th>
												<td>
													{new Date(
														latestMeasurement.timestamp,
													).toLocaleString()}
												</td>
											</tr>
										</tbody>
									</table>
									{/* Complete Examine Button - visible when measurement exists and patient is in checking status */}
									{selectedPatient?.status === "checking" && (
										<button
											className="btn btn-primary w-100 mt-3"
											onClick={handleCompleteExamine}
											disabled={loading}
										>
											<i className="bi bi-check-circle"></i>{" "}
											{loading
												? "Processing..."
												: "Complete Examine"}
										</button>
									)}
								</div>
							) : (
								<p className="text-muted text-center">
									No measurements recorded yet
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Measurement Entry Form */}
				<div className="col-md-6">
					<div className="card">
						<div className="card-header bg-success text-white">
							<h5 className="mb-0">
								Record Vitals (Manual Entry)
							</h5>
						</div>
						<div className="card-body">
							{!selectedPatient ? (
								<p className="text-muted text-center">
									Please select a patient first
								</p>
							) : (
								<form onSubmit={handleSaveMeasurement}>
									<div className="mb-3">
										<label className="form-label">
											Blood Pressure (e.g., 120/80)
										</label>
										<input
											type="text"
											className="form-control"
											name="blood_pressure"
											value={
												measurementData.blood_pressure
											}
											onChange={handleMeasurementChange}
											placeholder="120/80"
										/>
									</div>

									<div className="mb-3">
										<label className="form-label">
											Temperature (°C)
										</label>
										<input
											type="number"
											step="0.1"
											className="form-control"
											name="temperature"
											value={measurementData.temperature}
											onChange={handleMeasurementChange}
											placeholder="36.4"
										/>
									</div>

									<div className="mb-3">
										<label className="form-label">
											SpO₂ (%)
										</label>
										<input
											type="number"
											step="0.1"
											className="form-control"
											name="spo2"
											value={measurementData.spo2}
											onChange={handleMeasurementChange}
											placeholder="98"
											min="0"
											max="100"
										/>
									</div>

									<div className="mb-3">
										<label className="form-label">
											Heart Rate (bpm)
										</label>
										<input
											type="number"
											step="0.1"
											className="form-control"
											name="heart_rate"
											value={measurementData.heart_rate}
											onChange={handleMeasurementChange}
											placeholder="72"
										/>
									</div>

									<button
										type="submit"
										className="btn btn-success w-100"
										disabled={loading}
									>
										{loading
											? "Saving..."
											: "Save Measurement"}
									</button>
								</form>
							)}
						</div>
					</div>

					{/* IoT Device Integration */}
					<div className="card mt-3">
						<div className="card-header bg-info text-white">
							<h5 className="mb-0">IoT Device Integration</h5>
						</div>
						<div className="card-body text-center">
							<p className="mb-3">
								<strong>ESP32 Health Monitor:</strong>{" "}
								Automatically capture vital signs from connected
								IoT device.
							</p>
							<button
								className="btn btn-info text-white"
								onClick={handleStartDeviceMeasurement}
								disabled={
									!selectedPatient ||
									deviceMeasuring ||
									loading
								}
							>
								<i className="bi bi-device-hdd"></i>{" "}
								{deviceMeasuring
									? "Device Measuring..."
									: "Start Device Measurement"}
							</button>
							<p className="text-muted mt-2 small">
								{deviceMeasuring && (
									<span className="text-success">
										⏳ Waiting for device to complete
										measurement...
									</span>
								)}
								{!deviceMeasuring && (
									<span>
										Ensure ESP32 is connected and WiFi is
										online
									</span>
								)}
							</p>
						</div>
					</div>

					{/* Medical Report Upload */}
					<div className="card mt-3">
						<div className="card-header bg-warning">
							<h5 className="mb-0">
								<i className="bi bi-file-medical"></i> Upload
								Medical Report
							</h5>
						</div>
						<div className="card-body">
							<p className="mb-3">
								Upload lab reports, prescriptions, or medical
								documents for AI-powered analysis.
							</p>

							{/* File Upload or Camera Options */}
							<div className="mb-3">
								<div
									className="btn-group w-100 mb-2"
									role="group"
								>
									<input
										type="file"
										id="reportFileInput"
										className="d-none"
										accept="image/jpeg,image/jpg,image/png,application/pdf"
										onChange={handleFileSelect}
										disabled={
											!selectedPatient || uploadingReport
										}
									/>
									<label
										htmlFor="reportFileInput"
										className="btn btn-outline-primary w-50"
										style={{
											cursor:
												selectedPatient &&
												!uploadingReport
													? "pointer"
													: "not-allowed",
										}}
									>
										<i className="bi bi-folder2-open"></i>{" "}
										Choose File
									</label>

									<input
										type="file"
										id="reportCameraInput"
										className="d-none"
										accept="image/*"
										capture="environment"
										onChange={handleFileSelect}
										disabled={
											!selectedPatient || uploadingReport
										}
									/>
									<label
										htmlFor="reportCameraInput"
										className="btn btn-outline-primary w-50"
										style={{
											cursor:
												selectedPatient &&
												!uploadingReport
													? "pointer"
													: "not-allowed",
										}}
									>
										<i className="bi bi-camera"></i> Take
										Photo
									</label>
								</div>

								{selectedFile && (
									<div className="alert alert-success py-2 mb-0">
										<i className="bi bi-check-circle"></i>{" "}
										<strong>Selected:</strong>{" "}
										{selectedFile.name}
										<br />
										<small>
											Size:{" "}
											{(selectedFile.size / 1024).toFixed(
												2,
											)}{" "}
											KB
										</small>
									</div>
								)}
							</div>
							<button
								className="btn btn-warning w-100 mb-2"
								onClick={handleUploadReport}
								disabled={
									!selectedPatient ||
									!selectedFile ||
									uploadingReport
								}
							>
								<i className="bi bi-cloud-upload"></i>{" "}
								{uploadingReport
									? "Uploading & Analyzing..."
									: "Upload & Analyze Report"}
							</button>
							<p className="text-muted mb-2 small">
								<i className="bi bi-info-circle"></i> Supported
								formats: JPG, PNG, PDF (Max 10MB)
								<br />
								<strong>
									Azure AI Document Intelligence
								</strong>{" "}
								will extract text and key medical phrases
							</p>
							{selectedPatient && (
								<button
									className="btn btn-link btn-sm w-100 mt-2"
									onClick={() =>
										setShowReportAnalysis(
											!showReportAnalysis,
										)
									}
								>
									{showReportAnalysis ? "Hide" : "View"}{" "}
									Report Analysis
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HealthMonitoringStation;
