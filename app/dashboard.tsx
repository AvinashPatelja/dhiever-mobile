import { useAuth } from "@/contexts/AuthContext";
import { deviceAPI } from "@/services/api";
import { DeviceLiveData } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Three Phase Motor State
  const [threePhaseData, setThreePhaseData] = useState<DeviceLiveData | null>(
    null,
  );
  const [startDateTP, setStartDateTP] = useState<Date>(new Date());
  const [stopDateTP, setStopDateTP] = useState<Date>(new Date());
  const [showStartPickerTP, setShowStartPickerTP] = useState(false);
  const [showStopPickerTP, setShowStopPickerTP] = useState(false);

  // Gate Valve State
  const [gateValveDataList, setGateValveDataList] = useState<DeviceLiveData[]>(
    [],
  );
  const [currentGateValveIndex, setCurrentGateValveIndex] = useState(0);
  const [gateValveDateSettings, setGateValveDateSettings] = useState<{
    [key: string]: { startDate: Date; stopDate: Date };
  }>({});
  const [showStartPickerGV, setShowStartPickerGV] = useState(false);
  const [showStopPickerGV, setShowStopPickerGV] = useState(false);

  // Loading State
  const [loading, setLoading] = useState(true);

  const currentGateValve = gateValveDataList[currentGateValveIndex] || null;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user]);

  // Fetch device data
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await deviceAPI.getUserData(user!);
      console.log("API Response:", response.data);

      if (response.data.length > 0) {
        // Find the three phase device
        const threePhaseDevice = response.data.find(
          (device: DeviceLiveData) => device.deviceType === 1,
        );

        // Find all gate valve devices
        const gateValveDevices = response.data.filter(
          (device: DeviceLiveData) => device.deviceType === 2,
        );

        setThreePhaseData(threePhaseDevice || null);
        setGateValveDataList(gateValveDevices);

        if (threePhaseDevice) {
          setStartDateTP(new Date(threePhaseDevice.starTime));
          setStopDateTP(new Date(threePhaseDevice.endTime));
        }

        // Initialize date settings for each gate valve
        const dateSettings: {
          [key: string]: { startDate: Date; stopDate: Date };
        } = {};
        gateValveDevices.forEach((device: DeviceLiveData) => {
          dateSettings[device.imei] = {
            startDate: new Date(device.starTime),
            stopDate: new Date(device.endTime),
          };
        });
        setGateValveDateSettings(dateSettings);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch device data",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGateValveDateSettings = (imei: string) => {
    if (!gateValveDateSettings[imei]) {
      return { startDate: new Date(), stopDate: new Date() };
    }
    return gateValveDateSettings[imei];
  };

  const updateGateValveDateSettings = (
    imei: string,
    field: "startDate" | "stopDate",
    value: Date,
  ) => {
    setGateValveDateSettings((prev) => ({
      ...prev,
      [imei]: {
        ...getGateValveDateSettings(imei),
        [field]: value,
      },
    }));
  };

  const formatDateToLocal = (date: Date | null) => {
    if (!date) return null;
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().replace("Z", "");
  };

  const updateThreePhaseData = async (
    imei: string,
    status: boolean,
    startTime: Date | null,
    endTime: Date | null,
  ) => {
    if (!imei) {
      console.error("IMEI is missing");
      return;
    }

    try {
      const requestBody = {
        imei: imei,
        status: status,
        starTime: formatDateToLocal(startTime),
        endTime: formatDateToLocal(endTime),
      };

      await deviceAPI.upsertDeviceLive(requestBody);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Device data updated successfully!",
      });

      setThreePhaseData(
        threePhaseData ? { ...threePhaseData, status: status } : null,
      );

      // Update only the gate valve with defaultGV: true
      if (status) {
        setGateValveDataList((prevList) =>
          prevList.map((device) =>
            device.defaultGV ? { ...device, status: status } : device,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update Device data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update device data",
      });
    }
  };

  const updateGatevalveData = async (
    imei: string,
    status: boolean,
    startTime: Date | null,
    endTime: Date | null,
  ) => {
    if (!imei) {
      console.error("IMEI is missing");
      return;
    }

    try {
      const requestBody = {
        imei: imei,
        status: status,
        starTime: formatDateToLocal(startTime),
        endTime: formatDateToLocal(endTime),
      };

      await deviceAPI.upsertDeviceLive(requestBody);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Device data updated successfully!",
      });

      // Update the status of the specific gate valve
      setGateValveDataList((prevList) =>
        prevList.map((device) =>
          device.imei === imei ? { ...device, status } : device,
        ),
      );
    } catch (error) {
      console.error("Failed to update Device data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update device data",
      });
    }
  };

  const toggleDefaultGateValve = async (imei: string) => {
    try {
      const updatedGateValves = gateValveDataList.map((device) => ({
        ...device,
        defaultGV: device.imei === imei ? !device.defaultGV : false,
      }));

      await deviceAPI.updateDefaultGV(imei);

      setGateValveDataList(updatedGateValves);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Default Gate Valve Updated",
      });
    } catch (error) {
      console.error("Failed to update default gate valve:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update default gate valve",
      });
    }
  };

  const nextGateValve = () => {
    setCurrentGateValveIndex((prev) =>
      prev === gateValveDataList.length - 1 ? 0 : prev + 1,
    );
  };

  const prevGateValve = () => {
    setCurrentGateValveIndex((prev) =>
      prev === 0 ? gateValveDataList.length - 1 : prev - 1,
    );
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#027368" />
        <Text style={styles.loadingText}>Loading device data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.userName}>{user || "Guest"}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.deviceRegButton}
            onPress={() => router.push("/device-registration")}
          >
            <Text style={styles.deviceRegButtonText}>Device Reg</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 3 Phase Motor Card */}
        {threePhaseData ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>3 Phase Motor</Text>
            <Text style={styles.imeiText}>IMEI: {threePhaseData.imei}</Text>

            <View style={styles.deviceImage}>
              <Image
                // source={require("@/assets/images/3TP.PNG")}
                source={require("@/assets/images/GV.png")}
                style={styles.motorImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.startButton,
                  threePhaseData.status && styles.buttonDisabled,
                ]}
                onPress={() =>
                  updateThreePhaseData(threePhaseData.imei, true, null, null)
                }
                disabled={threePhaseData.status}
              >
                <Text style={styles.actionButtonText}>Start</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.stopButton,
                  !threePhaseData.status && styles.buttonDisabled,
                ]}
                onPress={() =>
                  updateThreePhaseData(threePhaseData.imei, false, null, null)
                }
                disabled={!threePhaseData.status}
              >
                <Text style={styles.actionButtonText}>Stop</Text>
              </TouchableOpacity>
            </View>

            {/* Date Time Pickers for Three Phase */}
            <View style={styles.datePickerSection}>
              <Text style={styles.dateLabel}>Start Time:</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartPickerTP(true)}
              >
                <Text style={styles.dateButtonText}>
                  {startDateTP.toLocaleString()}
                </Text>
              </TouchableOpacity>
              {showStartPickerTP && (
                <DateTimePicker
                  value={startDateTP}
                  mode="datetime"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowStartPickerTP(Platform.OS === "ios");
                    if (selectedDate) setStartDateTP(selectedDate);
                  }}
                />
              )}

              <Text style={styles.dateLabel}>Stop Time:</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStopPickerTP(true)}
              >
                <Text style={styles.dateButtonText}>
                  {stopDateTP.toLocaleString()}
                </Text>
              </TouchableOpacity>
              {showStopPickerTP && (
                <DateTimePicker
                  value={stopDateTP}
                  mode="datetime"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowStopPickerTP(Platform.OS === "ios");
                    if (selectedDate) setStopDateTP(selectedDate);
                  }}
                />
              )}

              <TouchableOpacity
                style={styles.setButton}
                onPress={() =>
                  updateThreePhaseData(
                    threePhaseData.imei,
                    true,
                    startDateTP,
                    stopDateTP,
                  )
                }
              >
                <Text style={styles.setButtonText}>Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>Loading Three Phase Data...</Text>
        )}

        {/* Gate Valve Motor Cards - Carousel */}
        {gateValveDataList.length > 0 ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Gate Valve Motor</Text>
              {gateValveDataList.length > 1 && (
                <Text style={styles.carouselCounter}>
                  ({currentGateValveIndex + 1}/{gateValveDataList.length})
                </Text>
              )}
            </View>

            {currentGateValve && (
              <>
                <Text style={styles.imeiText}>
                  IMEI: {currentGateValve.imei}
                </Text>

                {/* Default Toggle */}
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>Default</Text>
                  <Switch
                    value={currentGateValve.defaultGV}
                    onValueChange={() =>
                      toggleDefaultGateValve(currentGateValve.imei)
                    }
                    trackColor={{ false: "#ddd", true: "#027368" }}
                    thumbColor={currentGateValve.defaultGV ? "#fff" : "#f4f3f4"}
                  />
                </View>

                {/* Carousel Navigation */}
                {gateValveDataList.length > 1 && (
                  <View style={styles.carouselNav}>
                    <TouchableOpacity
                      style={styles.carouselButton}
                      onPress={prevGateValve}
                    >
                      <Ionicons name="chevron-back" size={24} color="#027368" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.carouselButton}
                      onPress={nextGateValve}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color="#027368"
                      />
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.deviceImage}>
                  <Image
                    source={require("@/assets/images/GV.png")}
                    style={styles.motorImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.startButton,
                      currentGateValve.status && styles.buttonDisabled,
                    ]}
                    onPress={() =>
                      updateGatevalveData(
                        currentGateValve.imei,
                        true,
                        null,
                        null,
                      )
                    }
                    disabled={currentGateValve.status}
                  >
                    <Text style={styles.actionButtonText}>Start</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.stopButton,
                      !currentGateValve.status && styles.buttonDisabled,
                    ]}
                    onPress={() =>
                      updateGatevalveData(
                        currentGateValve.imei,
                        false,
                        null,
                        null,
                      )
                    }
                    disabled={!currentGateValve.status}
                  >
                    <Text style={styles.actionButtonText}>Stop</Text>
                  </TouchableOpacity>
                </View>

                {/* Date Time Pickers for Gate Valve */}
                <View style={styles.datePickerSection}>
                  <Text style={styles.dateLabel}>Start Time:</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartPickerGV(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {getGateValveDateSettings(
                        currentGateValve.imei,
                      ).startDate.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                  {showStartPickerGV && (
                    <DateTimePicker
                      value={
                        getGateValveDateSettings(currentGateValve.imei)
                          .startDate
                      }
                      mode="datetime"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, selectedDate) => {
                        setShowStartPickerGV(Platform.OS === "ios");
                        if (selectedDate)
                          updateGateValveDateSettings(
                            currentGateValve.imei,
                            "startDate",
                            selectedDate,
                          );
                      }}
                    />
                  )}

                  <Text style={styles.dateLabel}>Stop Time:</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStopPickerGV(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {getGateValveDateSettings(
                        currentGateValve.imei,
                      ).stopDate.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                  {showStopPickerGV && (
                    <DateTimePicker
                      value={
                        getGateValveDateSettings(currentGateValve.imei).stopDate
                      }
                      mode="datetime"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, selectedDate) => {
                        setShowStopPickerGV(Platform.OS === "ios");
                        if (selectedDate)
                          updateGateValveDateSettings(
                            currentGateValve.imei,
                            "stopDate",
                            selectedDate,
                          );
                      }}
                    />
                  )}

                  <TouchableOpacity
                    style={styles.setButton}
                    onPress={() =>
                      updateGatevalveData(
                        currentGateValve.imei,
                        true,
                        getGateValveDateSettings(currentGateValve.imei)
                          .startDate,
                        getGateValveDateSettings(currentGateValve.imei)
                          .stopDate,
                      )
                    }
                  >
                    <Text style={styles.setButtonText}>Set</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ) : (
          <Text style={styles.noDataText}>No Gate Valve Data Available</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#027368",
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    color: "#fff",
    fontSize: 14,
  },
  userName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },
  deviceRegButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deviceRegButtonText: {
    color: "#027368",
    fontSize: 12,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#ff5722",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#027368",
    marginBottom: 10,
  },
  carouselCounter: {
    fontSize: 14,
    color: "#666",
  },
  imeiText: {
    fontSize: 14,
    color: "#027368",
    fontWeight: "600",
    marginBottom: 15,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  carouselNav: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginVertical: 10,
  },
  carouselButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
  },
  deviceImage: {
    alignItems: "center",
    marginVertical: 15,
  },
  motorImage: {
    width: 150,
    height: 150,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginVertical: 10,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "#4caf50",
  },
  stopButton: {
    backgroundColor: "#f44336",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  datePickerSection: {
    marginTop: 15,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  dateButton: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  dateButtonText: {
    fontSize: 14,
    color: "#333",
  },
  setButton: {
    backgroundColor: "#027368",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  setButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});
