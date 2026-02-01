Step 1: Identifying the Message Structure

  Based on the UMDF Market Data Specification (Section 4.2.4 & 5.2.1):
   1. The UDP Payload starts with a Technical Header.
   2. The Technical Header is 10 bytes long.
   3. The structure is: MsgSeqNum (4 bytes), NoChunks (2 bytes), CurrentChunk (2
      bytes), MsgLength (2 bytes).
   4. Data is Big-Endian.



Step 2: Assembled message from chunks 

According to the documentation (Section 5.2.1 Message Level Sequencing):

   1. MsgSeqNum: Identifies the whole message. All chunks belonging to the same message
      will share this same sequence number.
   2. NoChunks: The total number of chunks the original message was split into.
   3. CurrentChunk: The index (1-based) of the current chunk.
   4. MsgLength: The length of the FAST/FIX payload contained within this specific
      chunk (excluding the technical header).

  Usage:
  The client system (my script) must:
   1. Collect all packets with the same MsgSeqNum.
   2. Order them by CurrentChunk.
   3. Verify that we have all chunks (from 1 to NoChunks).
   4. Concatenate the payloads (everything after the 10-byte header) to reconstruct the
      full, original FAST-encoded message.
   5. Decode the reassembled buffer as a single FAST stream.

Step 3: FAST Protocol
"Decode the reassembled buffer as a single FAST stream" is conceptually simple, but
  the FAST Protocol itself is complex.

  The first bytes of the reassembled buffer are indeed the Presence Map (PMap).

  FAST Decoding Steps (Documentation 3.1.7, 3.1.12):
   1. Read the Presence Map (PMap): Variable length (stop-bit encoded). It tells us
      which optional fields are present in the message.
   2. Read the Template ID: The first field after the PMap is usually the Template ID
      (unless implied). This ID tells us which XML template to use for decoding the
      rest of the stream.
   3. Apply the Template: Using the Template ID, we decode the fields (Integers,
      Strings, Deltas, etc.) sequentially as defined in the B3 XML templates.
