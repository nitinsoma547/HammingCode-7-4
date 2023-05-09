def hamming_encode(data):
    data = [int(bit) for bit in data]
    p1 = data[0] ^ data[1] ^ data[3]
    p2 = data[0] ^ data[2] ^ data[3]
    p4 = data[1] ^ data[2] ^ data[3]
    return [p1] + [data[0]] + [p2] + [data[1]] + [p4] + data[2:]

def hamming_decode(encoded_data):
    encoded_data = [int(bit) for bit in encoded_data]
    p1 = encoded_data[0]
    p2 = encoded_data[2]
    p4 = encoded_data[4]
    
    p1_calc = encoded_data[1] ^ encoded_data[3] ^ encoded_data[5] ^ encoded_data[7]
    p2_calc = encoded_data[1] ^ encoded_data[3] ^ encoded_data[6] ^ encoded_data[7]
    p4_calc = encoded_data[3] ^ encoded_data[5] ^ encoded_data[6] ^ encoded_data[7]
    
    error_position = (p4 != p4_calc) * 4 + (p2 != p2_calc) * 2 + (p1 != p1_calc)
    
    if error_position > 0:
        encoded_data[error_position - 1] ^= 1

    return encoded_data[1] + encoded_data[3:5] + encoded_data[6:]

data = "1011"
encoded_data = hamming_encode(data)
print(f"Encoded data: {''.join(map(str, encoded_data))}")

# Simulate a single-bit error
encoded_data[2] ^= 1
print(f"Received data with error: {''.join(map(str, encoded_data))}")

decoded_data = hamming_decode(encoded_data)
print(f"Decoded data: {''.join(map(str, decoded_data))}")
