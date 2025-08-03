const mongoose = require('mongoose');

/**
 * Counter Schema
 *
 * This schema is used to store sequential counters for various entities
 * (e.g., users, orders, invoices) that require custom incremental IDs.
 *
 * Why this is needed:
 * --------------------
 * In many systems, especially when generating user-friendly IDs like
 * "PWP-000001", we need an incrementing, unique number instead of random strings.
 *
 * MongoDB doesn't support auto-increment fields by default, and relying on
 * queries + increment logic introduces the risk of race conditions under
 * high concurrency (e.g., multiple users signing up at the same time).
 *
 * This counter pattern solves that by:
 * - Keeping a separate document per counter (e.g., _id: 'userId')
 * - Using atomic $inc operations to ensure thread-safe, unique increments
 * - Avoiding collisions without requiring locking or transaction overhead
 *
 * Usage Example:
 * ----------------
 * const counter = await Counter.findByIdAndUpdate(
 *   { _id: 'userId' },
 *   { $inc: { seq: 1 } },
 *   { new: true, upsert: true }
 * );
 * const paddedId = String(counter.seq).padStart(6, '0');
 * const userId = `PWP-${paddedId}`;
 */

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // The name of the counter (e.g., 'userId')
  seq: { type: Number, default: 0 }      // The current sequence value
});

module.exports = mongoose.model('Counter', counterSchema);