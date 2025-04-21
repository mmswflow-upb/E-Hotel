const { db } = require("../firebase");
const Invoice = require("../models/invoice");

class InvoiceController {
  static async getInvoiceById(invoiceID) {
    try {
      const doc = await db.collection("invoices").doc(invoiceID).get();
      if (!doc.exists) {
        throw new Error("Invoice not found");
      }
      return new Invoice({ invoiceID: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error(`Error fetching invoice: ${error.message}`);
    }
  }

  static async getInvoicesByBooking(bookingID) {
    try {
      const snapshot = await db
        .collection("invoices")
        .where("bookingID", "==", bookingID)
        .get();

      return snapshot.docs.map(
        (doc) => new Invoice({ invoiceID: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error(`Error fetching booking invoices: ${error.message}`);
    }
  }

  static async getInvoicesByHotel(hotelID) {
    try {
      const snapshot = await db
        .collection("invoices")
        .where("hotelID", "==", hotelID)
        .get();

      return snapshot.docs.map(
        (doc) => new Invoice({ invoiceID: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error(`Error fetching hotel invoices: ${error.message}`);
    }
  }

  static async createInvoice(invoiceData) {
    try {
      const docRef = await db.collection("invoices").add(invoiceData);
      return new Invoice({ invoiceID: docRef.id, ...invoiceData });
    } catch (error) {
      throw new Error(`Error creating invoice: ${error.message}`);
    }
  }

  static async updateInvoice(invoiceID, invoiceData) {
    try {
      await db.collection("invoices").doc(invoiceID).update(invoiceData);
      return new Invoice({ invoiceID, ...invoiceData });
    } catch (error) {
      throw new Error(`Error updating invoice: ${error.message}`);
    }
  }

  static async addServiceToInvoice(invoiceID, serviceData) {
    try {
      const invoice = await this.getInvoiceById(invoiceID);
      const updatedServiceCharges = [...invoice.serviceCharges, serviceData];
      const totalAmount =
        invoice.roomCharges.reduce((sum, charge) => sum + charge.total, 0) +
        updatedServiceCharges.reduce((sum, charge) => sum + charge.total, 0);

      await db.collection("invoices").doc(invoiceID).update({
        serviceCharges: updatedServiceCharges,
        totalAmount,
      });

      return new Invoice({
        ...invoice,
        serviceCharges: updatedServiceCharges,
        totalAmount,
      });
    } catch (error) {
      throw new Error(`Error adding service to invoice: ${error.message}`);
    }
  }

  static async updateInvoiceStatus(invoiceID, status) {
    try {
      await db.collection("invoices").doc(invoiceID).update({ status });
      const invoice = await this.getInvoiceById(invoiceID);
      return new Invoice({ ...invoice, status });
    } catch (error) {
      throw new Error(`Error updating invoice status: ${error.message}`);
    }
  }
}

module.exports = InvoiceController;
