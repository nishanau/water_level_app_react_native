import { COLORS } from "@/constants";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface PricingTier {
  minVolume: number;
  maxVolume: number;
  pricePerLiter: number;
  _id: string;
}

interface Supplier {
  _id: string;
  company: string;
  pricing: PricingTier[];
  // ...other supplier properties
}

interface ManualOrderModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (orderData: {
    quantity: number;
    supplierId: string;
    deliveryDate: Date;
    notes: string;
  }) => Promise<void>;
  loading: boolean;
  suppliers: Supplier[];
  preferredSupplier?: string;
  tanks: [];
}

export function ManualOrderModal({
  visible,
  onClose,
  onConfirm,
  loading,
  suppliers,
  preferredSupplier,
  tanks,
}: ManualOrderModalProps) {
  const [quantity, setQuantity] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(preferredSupplier);
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState(0);
  // Calculate total price
  useEffect(() => {
    const supplier = suppliers.find((s) => s._id === selectedSupplier);
    const qty = parseFloat(quantity);

    if (supplier && !isNaN(qty)) {
      // Find the appropriate pricing tier based on quantity
      const applicableTier = supplier.pricing.find(
        (tier) => qty >= tier.minVolume && qty <= tier.maxVolume
      );

      if (applicableTier) {
        const formattedPrice = (qty * applicableTier.pricePerLiter).toFixed(2);
        setPrice(parseFloat(formattedPrice));

        return;
      }
    }
    setPrice(0);
  }, [quantity, selectedSupplier]);

  const handleConfirm = () => {
    const orderQuantity = parseInt(quantity);
    if (isNaN(orderQuantity) || orderQuantity <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid quantity");
      return;
    }
    if (!selectedSupplier) {
      Alert.alert("Invalid Input", "Please select a supplier");
      return;
    }
    console.log("tanks", tanks);
    const tankId = tanks._id;
    onConfirm({
      quantity: orderQuantity,
      supplierId: selectedSupplier,
      requestedDeliveryDate: deliveryDate,
      deliveryNotes: notes,
      tankId,
      price,
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDeliveryDate(selectedDate);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Place Manual Order</Text>

            <Text style={styles.label}>Quantity (Liters)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter quantity"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />

            <Text style={styles.label}>Select Supplier</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={preferredSupplier}
                onValueChange={(value) => setSelectedSupplier(value)}
                style={styles.picker}
              >
                <Picker.Item label="Select supplier" value="" />
                {suppliers.map((supplier) => (
                  <Picker.Item
                    key={supplier._id}
                    label={supplier.company}
                    value={supplier._id}
                    style={styles.dropdownText}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Total Price</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={price.toString()}
              editable={false}
            />

            <Text style={styles.label}>Requested Delivery Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{deliveryDate.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={deliveryDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Add any special instructions..."
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirm}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Placing Order..." : "Confirm Order"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: "500",
  },
  modalDescription: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 20,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: 20,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
    borderWidth: 0,
    backgroundColor: COLORS.lightGray,
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.text,
  },
  dateButton: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  disabledInput: {
    backgroundColor: COLORS.lightGray,
    color: COLORS.gray,
  },
  notesInput: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.gray,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
