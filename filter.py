def eachLetterOriginal(word):
    for j in range(len(word)):
        for i in range(j + 1, len(word)):
            if word[j] == word[i]:
                return False
    return True
            

with open("slova.txt", "r") as file:
    words = file.readlines()
    words = [word.split('/')[0] for word in words]
    filtered_words = [word.strip() for word in words if len(word.strip()) == 5]
    filtered_words = [word for word in filtered_words if eachLetterOriginal(word)]
    print(filtered_words)

with open("filtered_slova.txt", "w") as file:
    for word in filtered_words:
        file.write(word + "\n")

